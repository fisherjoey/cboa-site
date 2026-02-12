"""
Generate executive-placeholder.svg as a true vector SVG.

Recreates the basketball referee placeholder avatar that was previously
a 291KB base64-encoded PNG wrapped in SVG. Output is a clean ~5-8KB vector.

Usage: python generate-placeholder-svg.py
Output: ../public/images/executive-placeholder.svg
"""

import svgwrite
import math
import os

OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__), '..', 'public', 'images', 'executive-placeholder.svg'
)

W, H = 1024, 1024

# Colors
DARK_FILL = '#161710'
GRAY_FILL = '#b6b6b6'
HEAD_STROKE = '#1a1b11'
RED = '#fb0301'
PINSTRIPE_COLOR = '#a0a0a0'
WHITE = '#ffffff'


def create_svg():
    dwg = svgwrite.Drawing(
        OUTPUT_PATH,
        size=(f'{W}', f'{H}'),
        viewBox=f'0 0 {W} {H}',
    )
    dwg.attribs['xmlns'] = 'http://www.w3.org/2000/svg'

    # ── 1. Body silhouette (dark, back-most layer) ──
    # Symmetric path: left side defined, then mirrored for right
    # Shape: neck → shoulder → arm/side → bottom → mirror
    body_path = dwg.path(
        d=(
            # Start at left neck base (overlaps head bottom for seamless join)
            'M 420,448 '
            # Curve out to left shoulder
            'C 370,458 290,500 240,560 '
            # Curve down the left arm/side
            'C 180,640 130,720 107,800 '
            # Curve inward to bottom-left
            'C 100,840 140,880 200,920 '
            # Round to bottom-left corner
            'C 220,940 233,950 260,950 '
            # Straight across bottom
            'L 764,950 '
            # Round bottom-right corner
            'C 791,950 804,940 824,920 '
            # Curve up right side
            'C 884,880 924,840 917,800 '
            # Right arm/side going up
            'C 894,720 844,640 784,560 '
            # Right shoulder to neck
            'C 734,500 654,458 604,448 '
            # Close across neck
            'Z'
        ),
        fill=DARK_FILL,
        stroke='none',
    )
    dwg.add(body_path)

    # ── 2. Jersey body (gray area between raglan sleeve lines) ──
    # The jersey is the lighter gray area in the center of the torso
    jersey_path = dwg.path(
        d=(
            # Start at left raglan line top (near collar)
            'M 390,475 '
            # Raglan sleeve line curves down-left to armpit area
            'C 350,510 310,560 290,620 '
            # Down the side of jersey (inside the silhouette)
            'C 270,700 260,780 265,845 '
            # Across bottom of jersey
            'L 265,940 '
            'L 759,940 '
            # Up right side
            'L 759,845 '
            'C 764,780 754,700 734,620 '
            # Right raglan line up to collar
            'C 714,560 674,510 634,475 '
            # Across the top (will be covered by V-neck)
            'Z'
        ),
        fill=GRAY_FILL,
        stroke='none',
    )
    dwg.add(jersey_path)

    # ── 3. Pinstripes (clipped to jersey shape) ──
    clip_path = dwg.defs.add(dwg.clipPath(id='jersey-clip'))
    clip_path.add(dwg.path(
        d=(
            'M 390,475 '
            'C 350,510 310,560 290,620 '
            'C 270,700 260,780 265,845 '
            'L 265,940 '
            'L 759,940 '
            'L 759,845 '
            'C 764,780 754,700 734,620 '
            'C 714,560 674,510 634,475 '
            'Z'
        ),
    ))

    pinstripe_group = dwg.g(clip_path='url(#jersey-clip)')
    # Vertical pinstripes every ~55px across the jersey width
    for x in range(275, 760, 55):
        pinstripe_group.add(dwg.line(
            start=(x, 460),
            end=(x, 950),
            stroke=PINSTRIPE_COLOR,
            stroke_width=4,
        ))
    dwg.add(pinstripe_group)

    # ── 4. Head circle ──
    dwg.add(dwg.circle(
        center=(512, 271),
        r=197,
        fill=GRAY_FILL,
        stroke=HEAD_STROKE,
        stroke_width=6,
    ))

    # ── 5. V-neck collar ──
    collar_path = dwg.path(
        d=(
            # Outer V
            'M 355,450 '
            'L 512,535 '
            'L 669,450 '
            # Inner V (inset for ~35px band width)
            'L 636,470 '
            'L 512,498 '
            'L 388,470 '
            'Z'
        ),
        fill=RED,
        stroke='none',
    )
    dwg.add(collar_path)

    # ── 6. CBOC/CBAC patch ──
    patch_cx, patch_cy, patch_r = 656, 660, 95
    patch_group = dwg.g()

    # Red outer circle
    patch_group.add(dwg.circle(
        center=(patch_cx, patch_cy),
        r=patch_r,
        fill=RED,
        stroke='none',
    ))

    # White inner circle
    inner_r = 78
    patch_group.add(dwg.circle(
        center=(patch_cx, patch_cy),
        r=inner_r,
        fill=WHITE,
        stroke='none',
    ))

    # Curved text paths for CBOC (top) and CBAC (bottom)
    # Top arc for "CBOC" - clockwise arc
    top_arc_r = 58
    top_arc_path = dwg.path(
        d=f'M {patch_cx - top_arc_r},{patch_cy} '
          f'A {top_arc_r},{top_arc_r} 0 1,1 {patch_cx + top_arc_r},{patch_cy}',
        id='cboc-arc',
        fill='none',
        stroke='none',
    )
    dwg.defs.add(top_arc_path)

    cboc_text = dwg.text(
        '',
        font_size='28px',
        font_family='Arial, sans-serif',
        font_weight='bold',
        fill=DARK_FILL,
        text_anchor='middle',
    )
    cboc_tp = svgwrite.text.TextPath(
        '#cboc-arc',
        'CBOC',
        startOffset='50%',
    )
    cboc_text.add(cboc_tp)
    patch_group.add(cboc_text)

    # Bottom arc for "CBAC" - we need a flipped arc so text reads correctly
    bottom_arc_r = 58
    bottom_arc_path = dwg.path(
        d=f'M {patch_cx + bottom_arc_r},{patch_cy} '
          f'A {bottom_arc_r},{bottom_arc_r} 0 1,1 {patch_cx - bottom_arc_r},{patch_cy}',
        id='cbac-arc',
        fill='none',
        stroke='none',
    )
    dwg.defs.add(bottom_arc_path)

    cbac_text = dwg.text(
        '',
        font_size='28px',
        font_family='Arial, sans-serif',
        font_weight='bold',
        fill=DARK_FILL,
        text_anchor='middle',
    )
    cbac_tp = svgwrite.text.TextPath(
        '#cbac-arc',
        'CBAC',
        startOffset='50%',
    )
    cbac_text.add(cbac_tp)
    patch_group.add(cbac_text)

    # Simplified maple leaf in center
    # Small red maple leaf centered at patch center
    leaf_scale = 0.45
    leaf_cx, leaf_cy = patch_cx, patch_cy + 2

    # Simplified maple leaf path (normalized around 0,0, then translated)
    leaf_path_d = (
        'M 0,-35 '
        'L 5,-20 L 18,-25 L 12,-12 L 28,-14 L 16,-4 L 22,6 '
        'L 10,4 L 8,16 L 0,8 '
        'L -8,16 L -10,4 L -22,6 L -16,-4 L -28,-14 L -12,-12 '
        'L -18,-25 L -5,-20 Z'
    )
    leaf = dwg.path(
        d=leaf_path_d,
        fill=RED,
        stroke='none',
        transform=f'translate({leaf_cx},{leaf_cy}) scale({leaf_scale})',
    )
    patch_group.add(leaf)

    # Leaf stem
    patch_group.add(dwg.line(
        start=(leaf_cx, leaf_cy + 7),
        end=(leaf_cx, leaf_cy + 18),
        stroke=RED,
        stroke_width=2.5,
    ))

    dwg.add(patch_group)

    # Save
    dwg.save(pretty=True)
    file_size = os.path.getsize(OUTPUT_PATH)
    print(f'Generated: {OUTPUT_PATH}')
    print(f'File size: {file_size:,} bytes ({file_size/1024:.1f} KB)')


if __name__ == '__main__':
    create_svg()
