#!/usr/bin/env python

'''aalib_convert - Convert a single image file to text via AAlib

Usage: ./aalib_convert.py WIDTH HEIGHT < IMAGEFILE > TEXTFILE
'''

__copyright__ = '''\
Copyright (C) 2013  Volker Grabsch <v@njh.eu>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
'''

import aalib
import Image
import sys
import cStringIO

width = int(sys.argv[1])
height = int(sys.argv[2])

screen = aalib.AsciiScreen(width=width, height=height)
imageData = sys.stdin.read()
imageDataIO = cStringIO.StringIO(imageData)
image = Image.open(imageDataIO).convert('L').resize(screen.virtual_size)
screen.put_image((0, 0), image)
sys.stdout.write(screen.render())
sys.stdout.write('\n')
