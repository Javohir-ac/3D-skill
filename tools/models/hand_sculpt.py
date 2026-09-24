"""
Sculpted hand v2 ("premium sculpture" look) for story-3d-site — Blender 5.x headless:

  flatpak run --filesystem=/tmp --filesystem=home org.blender.Blender -b --factory-startup \
      --python tools/models/hand_sculpt.py -- <out_dir> [pose ...]

Why not metaballs (hand.py v1): metaballs melt everything into soft sausages —
no knuckles, no nails, no planes. Here the hand is assembled from anatomical
primitives (squared palm, tapered phalanges with an oval cross-section, dorsal
knuckle bumps, palm pads, thenar/hypothenar, metacarpal ridges, wrist, ulna
head, forearm), UNIONED with a voxel remesh (one watertight skin), relaxed with
a gentle smooth (fillets the joins like a sculptor's
brush), then crisp separate fingernails are added on top.

Convention (same as v1, see template/three/fx/HandModel.tsx): fingers +Y,
palm faces +Z, forearm down -Y, palm centre ≈ (0, 0.5, 0), fingertips y ≈ 2.
"""
import math
import os
import sys

import bpy
import bmesh
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "./out")
POSES = argv[1:] or ["reach", "open", "point", "fist"]
os.makedirs(OUT, exist_ok=True)

X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))

FINGERS = {
    #          base (MCP joint)       phalanx lengths       radii (root → tip)
    "index":  ((-0.32, 0.93, 0.0), (0.43, 0.27, 0.21), (0.112, 0.102, 0.092)),
    "middle": ((-0.105, 0.97, 0.0), (0.47, 0.3, 0.22), (0.116, 0.105, 0.094)),
    "ring":   ((0.11, 0.94, 0.0), (0.44, 0.28, 0.21), (0.108, 0.098, 0.088)),
    "pinky":  ((0.31, 0.86, -0.01), (0.35, 0.22, 0.18), (0.094, 0.085, 0.077)),
}
THUMB = ((-0.34, 0.2, 0.08), (0.36, 0.3, 0.25), (0.145, 0.125, 0.11))

POSE_TABLE = {
    #        per finger: (curl1, curl2, curl3, splay)     thumb: (curl1, curl2, curl3, spread)
    "reach": ({"index": (0.10, 0.16, 0.10, -0.08), "middle": (0.32, 0.50, 0.36, -0.02),
               "ring": (0.45, 0.66, 0.42, 0.05), "pinky": (0.55, 0.76, 0.46, 0.14)},
              (0.25, 0.25, 0.2, 0.55)),
    "open":  ({"index": (0.05, 0.08, 0.05, -0.16), "middle": (0.06, 0.10, 0.05, -0.04),
               "ring": (0.08, 0.12, 0.06, 0.08), "pinky": (0.10, 0.14, 0.08, 0.22)},
              (0.05, 0.1, 0.08, 0.95)),
    "point": ({"index": (0.02, 0.04, 0.02, -0.06), "middle": (1.40, 1.55, 0.90, 0.00),
               "ring": (1.45, 1.55, 0.90, 0.04), "pinky": (1.45, 1.50, 0.90, 0.08)},
              (0.95, 0.75, 0.35, 0.25)),
    "fist":  ({"index": (1.35, 1.55, 0.95, -0.02), "middle": (1.40, 1.60, 0.95, 0.00),
               "ring": (1.45, 1.60, 0.95, 0.03), "pinky": (1.45, 1.55, 0.95, 0.06)},
              (1.1, 0.85, 0.45, 0.2)),
}


# ── primitives (all go into one bmesh; the voxel remesh unions them) ──────────
def frame_matrix(center, s, n, d, sx, sy, sz):
    """Local x→s·sx, y→n·sy, z→d·sz, origin at center."""
    m = Matrix((s * sx, n * sy, d * sz)).transposed()
    if m.determinant() < 0:  # keep the frame right-handed, or the primitive's normals flip inside-out
        m = Matrix((-s * sx, n * sy, d * sz)).transposed()
    m = m.to_4x4()
    m.translation = center
    return m


def ellipsoid(bm, center, s, n, d, rs, rn, rd, square=1.0):
    """Ellipsoid (or a 'superellipsoid' with squarer sides when square < 1)."""
    geom = bmesh.ops.create_uvsphere(bm, u_segments=28, v_segments=18, radius=1.0)
    verts = geom["verts"]
    if square < 1.0:
        for v in verts:
            x, y, z = v.co
            v.co = Vector((math.copysign(abs(x) ** square, x), y, math.copysign(abs(z) ** square, z)))
    bmesh.ops.transform(bm, matrix=frame_matrix(center, s, n, d, rs, rn, rd), verts=verts)


def tube(bm, a, b, ra, rb, s_hint, flat=0.82):
    """Tapered tube a→b with an oval cross-section (thinner along n), capped by spheres."""
    d = (b - a).normalized()
    s = (s_hint - d * s_hint.dot(d)).normalized()
    n = d.cross(s).normalized()
    geom = bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=1.0, radius2=rb / ra, depth=1.0)
    bmesh.ops.transform(bm, matrix=frame_matrix((a + b) / 2, s, n, d, ra, ra * flat, (b - a).length), verts=geom["verts"])
    ellipsoid(bm, a, s, n, d, ra, ra * flat, ra)
    ellipsoid(bm, b, s, n, d, rb, rb * flat, rb)


def rot(v, axis, ang):
    return v * math.cos(ang) + axis.cross(v) * math.sin(ang) + axis * axis.dot(v) * (1 - math.cos(ang))


def finger(bm, nails, base, lens, radii, curls, d, n, knuckle_scale=1.0):
    """One finger. d = pointing direction, n = palm-side normal; curls bend d toward n."""
    p = Vector(base)
    s = d.cross(n).normalized()
    # MCP knuckle: bump on the back of the hand
    ellipsoid(bm, p - n * radii[0] * 0.18, s, n, d, radii[0] * 0.85 * knuckle_scale, radii[0] * 0.85, radii[0] * 0.95)
    for i, (L, r, c) in enumerate(zip(lens, radii, curls)):
        d, n = rot(d, s, c), rot(n, s, c)
        q = p + d * L
        r_end = radii[i + 1] if i < 2 else r * 0.92
        tube(bm, p, q, r, r_end, s)
        # fleshy pad on the palm side of each phalanx
        ellipsoid(bm, p + d * L * 0.5 + n * r * 0.16, s, n, d, r * 0.8, r * 0.68, L * 0.34)
        if i < 2:
            # joint knuckle (dorsal) — gives the finger its planes
            ellipsoid(bm, q - n * r * 0.12, s, n, d, r * 0.84, r * 0.72, r * 0.7)
        else:
            # rounded fingertip + nail
            ellipsoid(bm, q - d * r * 0.25 + n * r * 0.1, s, n, d, r * 0.95, r * 0.8, r * 1.0)
            nail_c = p + d * L * 0.55 - n * r * 0.62
            nails.append((nail_c, s, n, d, r * 0.78, r * 0.14, L * 0.46))
        p = q


def superbox(bm, center, half, square=0.45):
    ellipsoid(bm, Vector(center), X, Z, Y, half[0], half[2], half[1], square=square)


def build(pose):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bm = bmesh.new()
    nails = []
    fingers, thumb = POSE_TABLE[pose]

    # palm: squared slab + pads + thenar/hypothenar + dorsal metacarpals
    superbox(bm, (0.0, 0.5, 0.0), (0.44, 0.47, 0.13), square=0.8)
    superbox(bm, (0.0, 0.22, 0.0), (0.36, 0.22, 0.135), square=0.75)                # heel of the hand
    tube(bm, Vector((-0.31, 0.84, 0.045)), Vector((0.29, 0.78, 0.04)), 0.075, 0.065, X)  # distal palm pad
    ellipsoid(bm, Vector((-0.24, 0.26, 0.06)), X, Z, Y, 0.2, 0.12, 0.28)           # thenar
    ellipsoid(bm, Vector((0.24, 0.3, 0.04)), X, Z, Y, 0.15, 0.1, 0.3)             # hypothenar
    for name, (base, _, radii) in FINGERS.items():
        b = Vector(base)
        tube(bm, Vector((b.x * 0.45, 0.16, -0.05)), Vector((b.x * 0.95, b.y - 0.2, -0.06)), 0.042, 0.046, X, flat=0.9)
    # wrist, ulna head, forearm (oval, wider than thick)
    ellipsoid(bm, Vector((0.25, -0.08, -0.06)), X, Z, Y, 0.06, 0.055, 0.06)
    tube(bm, Vector((0, 0.22, 0.0)), Vector((0, -1.8, -0.04)), 0.27, 0.31, X, flat=0.66)
    tube(bm, Vector((0.04, -0.35, -0.04)), Vector((0.08, -1.3, -0.07)), 0.16, 0.2, X, flat=0.8)  # muscle belly

    bases = [Vector(v[0]) for v in FINGERS.values()]
    for b0, b1 in zip(bases, bases[1:]):
        ellipsoid(bm, (b0 + b1) / 2 + Vector((0, 0.1, 0.04)), X, Z, Y, 0.1, 0.06, 0.1)  # web between fingers
    for name, (base, lens, radii) in FINGERS.items():
        c1, c2, c3, splay = fingers[name]
        d = rot(Y, Z, -splay)
        finger(bm, nails, base, lens, radii, (c1, c2, c3), d, Z.copy())

    # thumb: metacarpal hidden in the thenar, then two phalanges; pad faces the fingers
    c1, c2, c3, spread = thumb
    base, lens, radii = THUMB
    d = Vector((-math.cos(spread), math.sin(spread) + 0.25, 0.45)).normalized()
    n = (Vector((0.55, 0.1, 0.85)) - d * Vector((0.55, 0.1, 0.85)).dot(d)).normalized()
    finger(bm, nails, base, lens, radii, (c1, c2, c3), d, n, knuckle_scale=0.9)

    me = bpy.data.meshes.new(f"hand_{pose}")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(f"hand_{pose}", me)
    bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)

    rem = ob.modifiers.new("remesh", "REMESH")
    rem.mode = "VOXEL"
    rem.voxel_size = 0.012
    bpy.ops.object.modifier_apply(modifier="remesh")
    # plain smoothing (Laplacian "volume preserve" leaves tiny spikes on voxel meshes)
    sm = ob.modifiers.new("smooth", "SMOOTH")
    sm.factor = 0.6
    sm.iterations = 18
    bpy.ops.object.modifier_apply(modifier="smooth")
    dec = ob.modifiers.new("decimate", "DECIMATE")
    dec.ratio = 0.22
    bpy.ops.object.modifier_apply(modifier="decimate")
    cs = ob.modifiers.new("cs", "CORRECTIVE_SMOOTH")
    cs.iterations = 3
    bpy.ops.object.modifier_apply(modifier="cs")

    # crisp nails (not remeshed): curved plates sitting on the fingertips
    nb = bmesh.new()
    for c, s, n, d, rs, rn, rd in nails:
        geom = bmesh.ops.create_uvsphere(nb, u_segments=20, v_segments=12, radius=1.0)
        for v in geom["verts"]:
            x, y, z = v.co
            v.co = Vector((x, y + 0.45 * x * x, z))  # dome outward, edges tuck in
        bmesh.ops.transform(nb, matrix=frame_matrix(c, s, n, d, rs, rn, rd), verts=geom["verts"])
    nm = bpy.data.meshes.new("nails")
    nb.to_mesh(nm)
    nb.free()
    nob = bpy.data.objects.new("nails", nm)
    bpy.context.collection.objects.link(nob)

    bpy.ops.object.select_all(action="DESELECT")
    nob.select_set(True)
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()
    return ob


def preview(obj, path):
    scn = bpy.context.scene
    scn.render.engine = "CYCLES"
    scn.cycles.samples = 48
    scn.cycles.device = "CPU"
    scn.render.resolution_x, scn.render.resolution_y = 800, 900
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.09, 0.1, 0.11, 1)
    scn.world = world
    mat = bpy.data.materials.new("plaster")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.55, 0.5, 0.46, 1)
    bsdf.inputs["Roughness"].default_value = 0.55
    bsdf.inputs["Subsurface Weight"].default_value = 0.15
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    for loc, energy, size in (((2.5, -1.5, 4.0), 900, 2.5), ((-3, 2.5, 2.0), 250, 3), ((0, 4, -3), 400, 2)):
        ld = bpy.data.lights.new("l", "AREA")
        ld.energy, ld.size = energy, size
        lo = bpy.data.objects.new("l", ld)
        lo.location = loc
        lo.rotation_euler = (Vector((0, 0.5, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        bpy.context.collection.objects.link(lo)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    bpy.context.collection.objects.link(cam)
    cam.location = VIEW
    cam.rotation_euler = (Vector((0, 0.65, 0)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = 42
    scn.camera = cam
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)


VIEW = (1.6, -0.6, 3.4)
for pose in POSES:
    o = build(pose)
    glb = os.path.join(OUT, f"hand_{pose}.glb")
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=True, export_apply=True,
                              export_yup=True, export_materials="NONE", export_draco_mesh_compression_enable=False)
    tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
    VIEW = (1.6, -0.6, 3.4)
    preview(o, os.path.join(OUT, f"hand_{pose}.png"))  # palm side
    VIEW = (-1.4, -0.4, -3.4)
    bpy.context.scene.camera.location = VIEW
    bpy.context.scene.camera.rotation_euler = (Vector((0, 0.65, 0)) - Vector(VIEW)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.render.filepath = os.path.join(OUT, f"hand_{pose}_back.png")
    bpy.ops.render.render(write_still=True)
    print(f"HAND2 {pose}: {len(o.data.vertices)} verts, ~{tris} tris -> {os.path.getsize(glb)//1024} KB")
