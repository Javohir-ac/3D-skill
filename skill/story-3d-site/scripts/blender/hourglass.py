"""
Procedural hourglass for story-3d-site (Blender 5.x, headless):

  flatpak run --filesystem=/tmp --filesystem=home org.blender.Blender -b --factory-startup \
      --python tools/models/hourglass.py -- <out_dir>

Two named meshes so the web side can give each its own material:
  glass — the lathed double bulb (thin shell, smooth normals)
  frame — top/bottom caps + three turned pillars (bevelled, looks carved)
Sand is NOT modelled: it is animated in three.js (cones whose height follows
the "time left" value), see template/three/fx/Hourglass.tsx.
Units: total height 2 (y -1..1), bulb radius 0.52, neck at y = 0.
"""
import math
import os
import sys

import bpy
import bmesh
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "./out")
os.makedirs(OUT, exist_ok=True)
SEG = 64


def lathe(name, profile, seg=SEG, cap=False):
    """Revolve a (radius, height) profile around the Z axis (Blender up)."""
    bm = bmesh.new()
    rings = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        ring = [bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for r, z in profile]
        rings.append(ring)
    for i in range(seg):
        r0, r1 = rings[i], rings[(i + 1) % seg]
        for k in range(len(profile) - 1):
            bm.faces.new((r0[k], r1[k], r1[k + 1], r0[k + 1]))
    if cap:
        bm.faces.new([r[0] for r in rings][::-1])
        bm.faces.new([r[-1] for r in rings])
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    return ob


def bulb_profile():
    """Glass outline from bottom (z=-0.86) through the neck (z=0) to the top."""
    pts = []
    n = 40
    for i in range(n + 1):
        t = i / n  # 0 bottom → 1 neck
        z = -0.86 + t * 0.86
        # rounded bulb that pinches to a thin neck: r = neck + bulb * sin-shaped
        bulge = math.sin(math.pi * min(1, (1 - t) * 1.05)) ** 0.8
        r = 0.045 + 0.47 * bulge * (1 - t ** 3)
        if t < 0.04:
            r = 0.3 + (r - 0.3) * t / 0.04  # closes toward the base plate
        pts.append((r, z))
    return pts + [(r, -z) for r, z in reversed(pts[:-1])]


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    glass = lathe("glass", bulb_profile())
    sol = glass.modifiers.new("solid", "SOLIDIFY")
    sol.thickness = 0.012
    sol.offset = 1

    parts = []
    # caps: turned discs with a lip
    cap_prof = [(0.0, 0.0), (0.66, 0.0), (0.7, 0.03), (0.7, 0.09), (0.64, 0.12), (0.58, 0.14), (0.0, 0.14)]
    for side in (-1, 1):
        prof = [(r, side * (0.86 + z)) for r, z in cap_prof]
        if side < 0:
            prof = prof[::-1]
        parts.append(lathe(f"cap{side}", prof, cap=False))
    # pillars: turned spindles with beads
    spindle = [(0.0, -0.86), (0.05, -0.86), (0.05, -0.8), (0.036, -0.7), (0.03, -0.3), (0.045, -0.06),
               (0.05, 0.0), (0.045, 0.06), (0.03, 0.3), (0.036, 0.7), (0.05, 0.8), (0.05, 0.86), (0.0, 0.86)]
    for i in range(3):
        a = 2 * math.pi * i / 3 + math.pi / 6
        ob = lathe(f"pillar{i}", spindle, seg=16)
        ob.location = (0.6 * math.cos(a), 0.6 * math.sin(a), 0)
        parts.append(ob)
    bpy.ops.object.select_all(action="DESELECT")
    for ob in parts:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.transform_apply(location=True)
    bpy.ops.object.join()
    frame = bpy.context.view_layer.objects.active
    frame.name = "frame"
    bev = frame.modifiers.new("bevel", "BEVEL")
    bev.width = 0.008
    bev.segments = 2
    bev.limit_method = "ANGLE"
    frame.modifiers.new("wn", "WEIGHTED_NORMAL")

    glb = os.path.join(OUT, "hourglass.glb")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True, export_draco_mesh_compression_enable=False)

    # preview
    scn = bpy.context.scene
    scn.render.engine = "BLENDER_WORKBENCH"
    scn.display.shading.light = "MATCAP"
    scn.render.resolution_x, scn.render.resolution_y = 700, 900
    scn.world = bpy.data.worlds.new("w")
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    bpy.context.collection.objects.link(cam)
    cam.location = (0, -4.6, 1.2)
    cam.rotation_euler = (Vector((0, 0, 0)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    scn.camera = cam
    scn.render.filepath = os.path.join(OUT, "hourglass.png")
    bpy.ops.render.render(write_still=True)
    print(f"HOURGLASS -> {glb} ({os.path.getsize(glb)//1024} KB)")


main()
