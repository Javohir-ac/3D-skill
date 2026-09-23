"""
Procedural miniature-city kit for story-3d-site (Blender 5.x, headless):

  flatpak run --filesystem=/tmp --filesystem=home org.blender.Blender -b --factory-startup \
      --python tools/models/city_kit.py -- <out_dir>

One GLB, one mesh per building type (node names are the type names):
  tower  — slim high-rise with two setbacks + roof crown
  slab   — wide office block with parapet and rooftop units
  house  — small gable-roof house with chimney
  round  — cylindrical tower with a stepped cap
  tree   — low-poly tree (trunk + two cones)
Every piece has a 1×1 footprint centred on the origin and stands on y = 0, so
the web side can place them with InstancedMesh (scale x/z = lot size, y = height
factor). Windows are NOT modelled — they are drawn in the shader from world
position, so they stay square whatever the instance scale is.
"""
import math
import os
import sys

import bpy
import bmesh
from mathutils import Matrix

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "./out")
os.makedirs(OUT, exist_ok=True)


def box(bm, cx, cz, w, d, y0, y1):
    """Axis-aligned box (Blender Z up: y here is height)."""
    m = Matrix.Translation((cx, cz, (y0 + y1) / 2)) @ Matrix.Diagonal((w, d, y1 - y0, 1))
    bmesh.ops.create_cube(bm, size=1, matrix=m)


def cyl(bm, cx, cz, r, y0, y1, seg=20, r2=None):
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2,
                          depth=y1 - y0, matrix=Matrix.Translation((cx, cz, (y0 + y1) / 2)))


def obj(name, build):
    bm = bmesh.new()
    build(bm)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    # tiny bevel catches light on the edges → reads as a model, not a box
    bev = ob.modifiers.new("bevel", "BEVEL")
    bev.width = 0.012
    bev.segments = 1
    bev.limit_method = "ANGLE"
    ob.modifiers.new("wn", "WEIGHTED_NORMAL")
    return ob


def tower(bm):
    box(bm, 0, 0, 0.9, 0.9, 0, 2.2)
    box(bm, 0, 0, 0.72, 0.72, 2.2, 2.9)
    box(bm, 0, 0, 0.5, 0.5, 2.9, 3.3)
    box(bm, 0, 0, 0.2, 0.2, 3.3, 3.55)          # crown
    cyl(bm, 0, 0, 0.012, 3.55, 3.95, seg=6)     # antenna


def slab(bm):
    box(bm, 0, 0, 0.95, 0.95, 0, 1.0)
    for sx, sz, w, d in ((0, 0.46, 0.95, 0.03), (0, -0.46, 0.95, 0.03), (0.46, 0, 0.03, 0.95), (-0.46, 0, 0.03, 0.95)):
        box(bm, sx, sz, w, d, 1.0, 1.06)          # parapet
    box(bm, -0.2, 0.15, 0.22, 0.18, 1.0, 1.12)   # rooftop units
    box(bm, 0.18, -0.12, 0.16, 0.16, 1.0, 1.1)
    cyl(bm, 0.25, 0.22, 0.07, 1.0, 1.16, seg=10)  # water tank


def house(bm):
    box(bm, 0, 0, 0.8, 0.9, 0, 0.5)
    # gable roof: triangular prism along z
    verts = [bm.verts.new(v) for v in (
        (-0.46, -0.5, 0.5), (0.46, -0.5, 0.5), (0, -0.5, 0.86),
        (-0.46, 0.5, 0.5), (0.46, 0.5, 0.5), (0, 0.5, 0.86))]
    a, b, c, d, e, f = verts
    for face in ((a, c, b), (d, e, f), (a, b, e, d), (b, c, f, e), (c, a, d, f)):
        bm.faces.new(face)
    box(bm, 0.22, 0.2, 0.1, 0.1, 0.62, 0.92)     # chimney
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)


def round_(bm):
    cyl(bm, 0, 0, 0.45, 0, 1.8, seg=24)
    cyl(bm, 0, 0, 0.36, 1.8, 2.2, seg=24)
    cyl(bm, 0, 0, 0.36, 2.2, 2.45, seg=24, r2=0.12)


def tree(bm):
    cyl(bm, 0, 0, 0.05, 0, 0.25, seg=6)
    cyl(bm, 0, 0, 0.3, 0.2, 0.6, seg=8, r2=0.12)
    cyl(bm, 0, 0, 0.22, 0.5, 0.9, seg=8, r2=0.0)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    kit = [obj("tower", tower), obj("slab", slab), obj("house", house), obj("round", round_), obj("tree", tree)]
    for o in kit:
        for p in o.data.polygons:
            p.use_smooth = False
    glb = os.path.join(OUT, "city_kit.glb")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True, export_draco_mesh_compression_enable=False)

    # preview: lay the kit out in a row
    for i, o in enumerate(kit):
        o.location.x = (i - 2) * 1.4
    scn = bpy.context.scene
    scn.render.engine = "BLENDER_WORKBENCH"
    scn.display.shading.light = "STUDIO"
    scn.display.shading.show_cavity = True
    scn.render.resolution_x, scn.render.resolution_y = 1200, 700
    scn.world = bpy.data.worlds.new("w")
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    bpy.context.collection.objects.link(cam)
    cam.location = (0, -8.5, 4.2)
    cam.rotation_euler = (math.radians(68), 0, 0)
    scn.camera = cam
    scn.render.filepath = os.path.join(OUT, "city_kit.png")
    bpy.ops.render.render(write_still=True)
    print(f"CITY KIT -> {glb} ({os.path.getsize(glb)//1024} KB)")


main()
