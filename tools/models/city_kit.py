"""
Architectural-maquette city kit v2 for story-3d-site (Blender 5.x, headless):

  flatpak run --filesystem=/tmp --filesystem=home org.blender.Blender -b --factory-startup \
      --python tools/models/city_kit.py -- <out_dir>

One GLB, one mesh per building type (node name = type):
  deco   — stepped art-deco tower with a spire          (the skyline)
  glass  — slim tower, tall narrow windows, crown
  round  — cylindrical tower with ribbon windows
  office — wide block, ribbon windows, parapet, rooftop plant
  flats  — residential block with balconies
  house  — gable house, windows + door, chimney
  clock  — clock tower: four clock faces with hands, pyramid roof (the landmark: "time")
  tree   — trunk + lumpy canopy
Windows are REAL geometry: every window is a recessed pane with reveals, so the
facade catches light like a physical model. Window panes carry a vertex colour
(COLOR_0: r = 1 for glass, g = random id) so the web shader can switch
individual windows on at night. Footprint ≤ 1×1 around the origin, base at y = 0.
"""
import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "./out")
os.makedirs(OUT, exist_ok=True)
rng = random.Random(7)

CELL = 0.16      # window module (width & storey height)
DEPTH = 0.022    # recess depth


class Builder:
    def __init__(self):
        self.bm = bmesh.new()
        self.col = self.bm.loops.layers.color.new("Col")
        self.glass = []   # faces to mark as windows

    # every face is created through here so we can tag it
    def quad(self, pts, glass=False):
        vs = [self.bm.verts.new(p) for p in pts]
        f = self.bm.faces.new(vs)
        if glass:
            self.glass.append(f)
        return f

    def box(self, c, size):
        """Solid box, c = centre of the BOTTOM face (x, y, z-up blender)."""
        m = Matrix.Translation((c[0], c[1], c[2] + size[2] / 2)) @ Matrix.Diagonal((*size, 1))
        bmesh.ops.create_cube(self.bm, size=1, matrix=m)

    def cyl(self, c, r, h, seg=24, r2=None):
        bmesh.ops.create_cone(self.bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2,
                              depth=h, matrix=Matrix.Translation((c[0], c[1], c[2] + h / 2)))

    def facade(self, o, u, v, n, W, H, cols=None, rows=None, mx=0.26, my=0.22, band=None):
        """Wall W×H from corner o along u (width) and v (up), outward normal n.
        Cells with a recessed window; `band` = (bottom, top) solid heights."""
        o, u, v, n = Vector(o), Vector(u), Vector(v), Vector(n)
        b0, b1 = band or (0.0, 0.0)
        cols = cols or max(1, round(W / CELL))
        rows = rows or max(1, round((H - b0 - b1) / CELL))
        cw, ch = W / cols, (H - b0 - b1) / rows
        if b0 > 0:
            self.quad([o, o + u * W, o + u * W + v * b0, o + v * b0])
        if b1 > 0:
            t = o + v * (H - b1)
            self.quad([t, t + u * W, t + u * W + v * b1, t + v * b1])
        for i in range(cols):
            for j in range(rows):
                a = o + u * (i * cw) + v * (b0 + j * ch)
                A = [a, a + u * cw, a + u * cw + v * ch, a + v * ch]
                ix, iy = cw * mx, ch * my
                ia = a + u * ix + v * iy
                I = [ia, ia + u * (cw - 2 * ix), ia + u * (cw - 2 * ix) + v * (ch - 2 * iy), ia + v * (ch - 2 * iy)]
                R = [p - n * DEPTH for p in I]
                for k in range(4):
                    self.quad([A[k], A[(k + 1) % 4], I[(k + 1) % 4], I[k]])      # frame
                    self.quad([I[k], I[(k + 1) % 4], R[(k + 1) % 4], R[k]])      # reveal
                self.quad(R, glass=True)                                          # pane

    def walls(self, cx, cy, z0, w, d, H, **kw):
        """Four facades of a w×d block standing at z0."""
        x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - d / 2, cy + d / 2
        up = (0, 0, 1)
        self.facade((x0, y0, z0), (1, 0, 0), up, (0, -1, 0), w, H, **kw)
        self.facade((x1, y0, z0), (0, 1, 0), up, (1, 0, 0), d, H, **kw)
        self.facade((x1, y1, z0), (-1, 0, 0), up, (0, 1, 0), w, H, **kw)
        self.facade((x0, y1, z0), (0, -1, 0), up, (-1, 0, 0), d, H, **kw)
        # roof slab (slightly overhanging) closes the block
        self.box((cx, cy, z0 + H), (w + 0.03, d + 0.03, 0.03))

    def finish(self, name):
        glass = set(self.glass)
        for f in self.bm.faces:
            g = rng.random()
            for loop in f.loops:
                loop[self.col] = (1.0, g, 0.0, 1.0) if f in glass else (0.0, 0.0, 0.0, 1.0)
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        me = bpy.data.meshes.new(name)
        self.bm.to_mesh(me)
        self.bm.free()
        ob = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(ob)
        me.color_attributes.active_color = me.color_attributes[0]
        return ob


def deco():
    b = Builder()
    b.box((0, 0, 0), (0.9, 0.9, 0.06))                              # plinth
    b.walls(0, 0, 0.06, 0.82, 0.82, 2.0, band=(0.14, 0.06))
    b.walls(0, 0, 2.09, 0.62, 0.62, 0.9, band=(0.0, 0.06))
    b.walls(0, 0, 3.02, 0.42, 0.42, 0.55, band=(0.0, 0.08))
    b.cyl((0, 0, 3.6), 0.12, 0.35, seg=8, r2=0.0)                   # crown
    b.cyl((0, 0, 3.9), 0.012, 0.5, seg=6)                           # spire
    return b.finish("deco")


def glass():
    b = Builder()
    b.walls(0, 0, 0, 0.72, 0.72, 3.0, cols=6, rows=26, mx=0.12, my=0.08, band=(0.12, 0.0))
    b.box((0, 0, 3.03), (0.5, 0.5, 0.18))
    b.box((0, 0, 3.21), (0.12, 0.12, 0.3))
    return b.finish("glass")


def round_():
    b = Builder()
    seg, R, H, rows = 20, 0.4, 2.4, 14
    b.cyl((0, 0, 0), R + 0.03, 0.1, seg=seg)
    for i in range(seg):
        a0, a1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
        p0 = Vector((R * math.cos(a0), R * math.sin(a0), 0.1))
        p1 = Vector((R * math.cos(a1), R * math.sin(a1), 0.1))
        u = p1 - p0
        nrm = Vector((math.cos((a0 + a1) / 2), math.sin((a0 + a1) / 2), 0))
        b.facade(p0, u.normalized(), (0, 0, 1), nrm, u.length, H, cols=1, rows=rows, mx=0.06, my=0.3)
    b.cyl((0, 0, 2.5), R + 0.02, 0.05, seg=seg)
    b.cyl((0, 0, 2.55), R * 0.7, 0.3, seg=seg, r2=R * 0.25)
    return b.finish("round")


def office():
    b = Builder()
    b.walls(0, 0, 0, 0.92, 0.92, 1.3, rows=8, mx=0.04, my=0.3, band=(0.12, 0.0))
    for sx, sy, w, d in ((0, 0.455, 0.95, 0.03), (0, -0.455, 0.95, 0.03), (0.455, 0, 0.03, 0.95), (-0.455, 0, 0.03, 0.95)):
        b.box((sx, sy, 1.33), (w, d, 0.06))                         # parapet
    b.box((-0.18, 0.12, 1.33), (0.28, 0.2, 0.12))                   # rooftop plant
    b.box((0.2, -0.15, 1.33), (0.18, 0.18, 0.1))
    b.cyl((0.24, 0.24, 1.33), 0.07, 0.16, seg=12)
    return b.finish("office")


def flats():
    b = Builder()
    b.walls(0, 0, 0, 0.86, 0.86, 1.1, band=(0.1, 0.0))
    # balconies: thin slabs on the front and back every storey
    for j in range(1, 6):
        z = 0.1 + j * 0.16
        for sy in (-0.47, 0.47):
            for sx in (-0.24, 0.16):
                b.box((sx, sy, z - 0.012), (0.2, 0.08, 0.012))
                b.box((sx, sy + (0.035 if sy > 0 else -0.035), z), (0.2, 0.008, 0.05))  # railing
    return b.finish("flats")


def house():
    b = Builder()
    b.walls(0, 0, 0, 0.7, 0.8, 0.46, cols=3, rows=2, mx=0.3, my=0.25, band=(0.04, 0.02))
    verts = [b.bm.verts.new(v) for v in (
        (-0.4, -0.45, 0.49), (0.4, -0.45, 0.49), (0, -0.45, 0.82),
        (-0.4, 0.45, 0.49), (0.4, 0.45, 0.49), (0, 0.45, 0.82))]
    a, bb, c, d, e, f = verts
    for face in ((a, c, bb), (d, e, f), (a, bb, e, d), (bb, c, f, e), (c, a, d, f)):
        b.bm.faces.new(face)
    b.box((0.18, 0.18, 0.62), (0.09, 0.09, 0.28))                   # chimney
    return b.finish("house")


def clock():
    b = Builder()
    b.box((0, 0, 0), (0.9, 0.9, 0.08))
    b.walls(0, 0, 0.08, 0.6, 0.6, 2.2, cols=3, mx=0.35, my=0.2, band=(0.3, 0.1))
    b.box((0, 0, 2.38), (0.66, 0.66, 0.5))                          # clock stage
    for ang in range(4):
        rot = Matrix.Rotation(ang * math.pi / 2, 4, "Z")
        face = bmesh.ops.create_cone(b.bm, cap_ends=True, segments=32, radius1=0.24, radius2=0.24, depth=0.03,
                                     matrix=rot @ Matrix.Translation((0, -0.34, 2.63)) @ Matrix.Rotation(math.pi / 2, 4, "X"))
        b.glass.extend({f for v in face["verts"] for f in v.link_faces})                               # dial glows at night
        for L, a in ((0.17, 0.2), (0.12, 2.1)):                    # hands
            m = rot @ Matrix.Translation((0, -0.36, 2.63)) @ Matrix.Rotation(a, 4, "Y") @ Matrix.Translation((0, 0, L / 2)) @ Matrix.Diagonal((0.02, 0.01, L, 1))
            bmesh.ops.create_cube(b.bm, size=1, matrix=m)
    b.box((0, 0, 2.88), (0.72, 0.72, 0.04))
    b.cyl((0, 0, 2.92), 0.48, 0.55, seg=4, r2=0.0)                  # pyramid roof
    return b.finish("clock")


def tree():
    b = Builder()
    b.cyl((0, 0, 0), 0.04, 0.3, seg=6)
    for x, y, z, r in ((0, 0, 0.5, 0.26), (0.13, 0.06, 0.4, 0.18), (-0.12, -0.05, 0.42, 0.19), (0.02, -0.1, 0.66, 0.16)):
        bmesh.ops.create_icosphere(b.bm, subdivisions=2, radius=r, matrix=Matrix.Translation((x, y, z)))
    return b.finish("tree")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    kit = [deco(), glass(), round_(), office(), flats(), house(), clock(), tree()]
    glb = os.path.join(OUT, "city_kit.glb")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=True, export_apply=True,
                              export_yup=True, export_materials="NONE", export_vertex_color="ACTIVE",
                              export_draco_mesh_compression_enable=False)
    for o in kit:
        print(f"  {o.name}: {len(o.data.polygons)} faces")

    # preview row (Cycles, plaster + glowing windows)
    for i, o in enumerate(kit):
        o.location.x = (i - 3.5) * 1.25
    mat = bpy.data.materials.new("m")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.42, 0.44, 0.43, 1)
    bsdf.inputs["Roughness"].default_value = 0.7
    attr = nt.nodes.new("ShaderNodeVertexColor")
    attr.layer_name = "Col"
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(attr.outputs["Color"], sep.inputs[0])
    nt.links.new(sep.outputs[0], bsdf.inputs["Emission Strength"])
    bsdf.inputs["Emission Color"].default_value = (1.0, 0.75, 0.45, 1)
    for o in kit:
        o.data.materials.append(mat)
    scn = bpy.context.scene
    scn.render.engine = "CYCLES"
    scn.cycles.samples = 32
    scn.render.resolution_x, scn.render.resolution_y = 1600, 700
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.07, 0.07, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 3
    scn.world = w
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 2.5
    sun.rotation_euler = (math.radians(50), 0, math.radians(35))
    bpy.context.collection.objects.link(sun)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    bpy.context.collection.objects.link(cam)
    cam.location = (0, -10.5, 4.2)
    cam.rotation_euler = (math.radians(74), 0, 0)
    cam.data.lens = 38
    scn.camera = cam
    scn.render.filepath = os.path.join(OUT, "city_kit.png")
    bpy.ops.render.render(write_still=True)
    print(f"CITY KIT -> {glb} ({os.path.getsize(glb)//1024} KB)")


main()
