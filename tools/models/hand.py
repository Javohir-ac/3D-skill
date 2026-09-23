"""
Procedural stylised hand for story-3d-site (Blender 5.x, run headless):

  flatpak run --filesystem=/tmp --filesystem=home org.blender.Blender -b --factory-startup \
      --python tools/models/hand.py -- <out_dir> [pose ...]

Technique: metaballs. Capsules for finger bones + ellipsoids for the palm and a
tapered forearm melt together into one soft, sculpted-looking surface (the
"clay hand" look of why.zero.university), then get converted to a mesh,
decimated, smoothed and exported as GLB (compressed afterwards with gltf-transform).

Poses (curl angles per joint, radians; splay per finger):
  reach — Michelangelo's reaching hand: index leads, others relaxed
  open  — open palm, fingers slightly spread
  point — index straight, others curled into the palm
  fist  — everything curled
Also renders a quick preview PNG per pose (Workbench engine).
"""
import math
import os
import sys

import bpy
from mathutils import Euler, Quaternion, Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "./out")
POSES = argv[1:] or ["reach", "open", "point", "fist"]
os.makedirs(OUT, exist_ok=True)

# ── anatomy (hand points +Y, palm faces +Z, length unit ≈ 1 palm) ─────────────
FINGERS = {
    #          base on palm          seg lengths          radii (root→tip)
    "index":  ((-0.36, 0.92, 0.0), (0.50, 0.30, 0.24), (0.098, 0.088, 0.078)),
    "middle": ((-0.12, 0.98, 0.0), (0.55, 0.33, 0.25), (0.100, 0.090, 0.080)),
    "ring":   ((0.12, 0.93, 0.0), (0.50, 0.31, 0.24), (0.094, 0.085, 0.075)),
    "pinky":  ((0.34, 0.82, 0.0), (0.40, 0.25, 0.20), (0.082, 0.074, 0.066)),
}
THUMB = ((-0.42, 0.28, 0.06), (0.42, 0.32, 0.26), (0.13, 0.11, 0.092))

POSE_TABLE = {
    #        per finger: (curl1, curl2, curl3, splay)     thumb: (curl1, curl2, curl3, spread)
    "reach": ({"index": (0.12, 0.18, 0.10, -0.10), "middle": (0.35, 0.55, 0.40, -0.02),
               "ring": (0.48, 0.70, 0.45, 0.06), "pinky": (0.58, 0.80, 0.50, 0.16)},
              (0.55, 0.35, 0.25, 0.30)),  # thumb relaxed alongside the index
    "open":  ({"index": (0.05, 0.08, 0.05, -0.16), "middle": (0.06, 0.10, 0.05, -0.04),
               "ring": (0.08, 0.12, 0.06, 0.08), "pinky": (0.10, 0.14, 0.08, 0.22)},
              (0.10, 0.12, 0.08, 0.85)),
    "point": ({"index": (0.02, 0.04, 0.02, -0.06), "middle": (1.40, 1.55, 0.90, 0.00),
               "ring": (1.45, 1.55, 0.90, 0.04), "pinky": (1.45, 1.50, 0.90, 0.08)},
              (0.55, 0.45, 0.30, 0.35)),
    "fist":  ({"index": (1.35, 1.55, 0.95, -0.02), "middle": (1.40, 1.60, 0.95, 0.00),
               "ring": (1.45, 1.60, 0.95, 0.03), "pinky": (1.45, 1.55, 0.95, 0.06)},
              (0.70, 0.60, 0.40, 0.30)),
}


# With stiffness 2 and threshold 0.6 the visible surface of a metaball sits at
# ~57.5% of its influence radius: (1 - x²)³ = 0.6 / 2  →  x ≈ 0.575.
# All sizes below are VISIBLE sizes; these helpers convert them.
VIS = 0.575


def add_capsule(mb, a: Vector, b: Vector, r: float):
    """Metaball capsule between points a and b with visible radius r."""
    el = mb.elements.new(type="CAPSULE")
    d = b - a
    el.co = (a + b) / 2
    el.size_x = d.length / 2
    el.radius = r / VIS
    el.rotation = Vector((1, 0, 0)).rotation_difference(d.normalized())
    el.stiffness = 2.0


def add_ellipsoid(mb, c, half, rot=(0, 0, 0)):
    """Ellipsoid with visible half-extents `half` (x, y, z)."""
    el = mb.elements.new(type="ELLIPSOID")
    el.co = c
    el.radius = 1.0
    el.size_x, el.size_y, el.size_z = (h / VIS for h in half)
    el.rotation = Euler(rot).to_quaternion()
    el.stiffness = 2.0


def build(pose: str):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mbd = bpy.data.metaballs.new("hand")
    mbd.resolution = 0.018
    mbd.render_resolution = 0.018
    mbd.threshold = 0.6
    obj = bpy.data.objects.new("hand", mbd)
    bpy.context.collection.objects.link(obj)

    fingers, thumb = POSE_TABLE[pose]
    # palm: a flattened ellipsoid + knuckle ridge + heel of the hand
    add_ellipsoid(mbd, (0.0, 0.48, 0.0), (0.44, 0.48, 0.13))
    add_capsule(mbd, Vector((-0.36, 0.86, 0.0)), Vector((0.34, 0.78, 0.0)), 0.11)  # knuckle ridge
    add_ellipsoid(mbd, (-0.2, 0.16, 0.06), (0.2, 0.2, 0.12))  # thenar (thumb muscle)
    add_ellipsoid(mbd, (0.22, 0.16, 0.03), (0.18, 0.22, 0.1))  # hypothenar
    # wrist + tapered forearm
    add_capsule(mbd, Vector((0, 0.05, 0)), Vector((0, -0.3, 0)), 0.22)
    add_capsule(mbd, Vector((0, -0.3, 0)), Vector((0, -1.1, -0.02)), 0.25)
    add_capsule(mbd, Vector((0, -1.1, -0.02)), Vector((0, -1.8, -0.04)), 0.28)

    # fingers: chain of capsules; each joint curls toward the palm (+Z) around local X
    for name, (base, lens, radii) in FINGERS.items():
        c1, c2, c3, splay = fingers[name]
        p = Vector(base)
        d = Euler((0, 0, -splay)).to_quaternion() @ Vector((0, 1, 0))
        curl_axis = Euler((0, 0, -splay)).to_quaternion() @ Vector((1, 0, 0))
        for seg, (L, r, c) in enumerate(zip(lens, radii, (c1, c2, c3))):
            d = Quaternion(curl_axis, -c) @ d
            q = p + d * L
            # pull interior ends back so neighbouring caps don't stack into knobby
            # "sausage" joints (overlapping metaball density adds up)
            a_ = p + d * (r * 0.75 if seg > 0 else 0)
            b_ = q - d * (r * 0.75 if seg < 2 else 0)
            add_capsule(mbd, a_, b_, r)
            p = q
        # soft fingertip pad
        add_ellipsoid(mbd, tuple(p - d * 0.04), (radii[-1] * 1.02, radii[-1] * 1.1, radii[-1] * 0.95))

    # thumb: starts from the palm side, sweeps outward, curls across the palm
    c1, c2, c3, spread = thumb
    base, lens, radii = THUMB
    p = Vector(base)
    d = Vector((-math.cos(spread) * 0.9, math.sin(spread) * 0.9 + 0.2, 0.35)).normalized()
    axis = d.cross(Vector((0, 0, 1))).normalized()
    for seg, (L, r, c) in enumerate(zip(lens, radii, (c1, c2, c3))):
        d = Quaternion(axis, -c) @ d
        q = p + d * L
        a_ = p + d * (r * 0.7 if seg > 0 else 0)
        b_ = q - d * (r * 0.7 if seg < 2 else 0)
        add_capsule(mbd, a_, b_, r)
        p = q

    # metaball → mesh → decimate → smooth
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    mesh_obj = bpy.context.view_layer.objects.active
    dec = mesh_obj.modifiers.new("decimate", "DECIMATE")
    dec.ratio = 0.35
    bpy.ops.object.modifier_apply(modifier="decimate")
    sm = mesh_obj.modifiers.new("smooth", "CORRECTIVE_SMOOTH")
    sm.iterations = 6
    bpy.ops.object.modifier_apply(modifier="smooth")
    bpy.ops.object.shade_smooth()
    mesh_obj.name = f"hand_{pose}"
    # centre on the palm, 1 unit ≈ palm height
    mesh_obj.location = (0, 0, 0)
    return mesh_obj


def render_preview(obj, path):
    scn = bpy.context.scene
    scn.render.engine = "BLENDER_WORKBENCH"
    scn.display.shading.light = "MATCAP"
    scn.display.shading.color_type = "SINGLE"
    scn.display.shading.single_color = (0.25, 0.85, 0.5)
    scn.render.resolution_x, scn.render.resolution_y = 900, 900
    scn.render.film_transparent = False
    world = bpy.data.worlds.new("w")
    scn.world = world
    cam_data = bpy.data.cameras.new("cam")
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = (1.4, -0.3, 3.1)
    target = Vector((0, 0.55, 0))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam_data.lens = 45
    scn.camera = cam
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)


for pose in POSES:
    o = build(pose)
    tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
    glb = os.path.join(OUT, f"hand_{pose}.glb")
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=glb, export_format="GLB", use_selection=True,
        # Draco is applied afterwards with gltf-transform (the flatpak Blender ships
        # without libdraco): npx @gltf-transform/cli optimize in.glb out.glb
        export_draco_mesh_compression_enable=False,
        export_apply=True, export_yup=True,
    )
    render_preview(o, os.path.join(OUT, f"hand_{pose}.png"))
    print(f"HAND {pose}: {len(o.data.vertices)} verts, ~{tris} tris -> {glb} ({os.path.getsize(glb)//1024} KB)")
