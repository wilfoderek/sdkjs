/*
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

 (function(window, undefined) {
	
    //module;

    window['AscFonts'] = window['AscFonts'] || {};
    var AscFonts = window['AscFonts'];

    function _FT_Common()
    {
        this.UintToInt = function(v)
        {
            return (v>2147483647)?v-4294967296:v;
        };
        this.UShort_To_Short = function(v)
        {
            return (v>32767)?v-65536:v;
        };
        this.IntToUInt = function(v)
        {
            return (v<0)?v+4294967296:v;
        };
        this.Short_To_UShort = function(v)
        {
            return (v<0)?v+65536:v;
        };
        this.memset = function(d,v,s)
        {
            for (var i=0;i<s;i++)
                d[i]=v;
        };
    }
    var FT_Common = new _FT_Common();

    function FT_Stream(data, size)
    {
        this.obj = null;
        this.data = data;
        this.size = size;
        this.pos = 0;
        this.cur = 0;
    }
    FT_Stream.prototype =
    {
        Seek: function (_pos)
        {
            if (_pos > this.size)
                return 85;
            this.pos = _pos;
            return 0;
        },
        Skip: function (_skip)
        {
            if (_skip < 0)
                return 85;
            return this.Seek(this.pos + _skip);
        },
        Read: function (pointer, count)
        {
            return this.ReadAt(this.pos, pointer, count);
        },
        ReadArray: function (count)
        {
            var read_bytes = this.size - this.pos;
            if (read_bytes > count)
                read_bytes = count;
            if (0 == read_bytes)
                return null;
            var a = new Array(read_bytes);
            for (var i = 0; i < count; i++)
                a[i] = this.data[this.pos + i];
            return a;
        },
        ReadAt: function (_pos, pointer, count)
        {
            if (_pos > this.size)
                return 85;
            var read_bytes = this.size - _pos;
            if (read_bytes > count)
                read_bytes = count;

            FT_Common.memcpy_p2(pointer, this.data, _pos, count);

            this.pos = _pos + read_bytes;

            if (read_bytes < count)
                return 85;

            return 0;
        },
        TryRead: function (pointer, count)
        {
            var read_bytes = 0;
            if (this.pos < this.size)
                return read_bytes;
            read_bytes = this.size - this.pos;
            if (read_bytes > count)
                read_bytes = count;

            FT_Common.memcpy_p2(pointer, this.data, this.pos, count);

            this.pos += read_bytes;
            return read_bytes;
        },

        // 1 bytes
        GetUChar: function ()
        {
            if (this.cur >= this.size)
                return 0;
            return this.data[this.cur++];
        },
        GetChar: function ()
        {
            if (this.cur >= this.size)
                return 0;
            var m = this.data[this.cur++];
            if (m > 127)
                m -= 256;
            return m;
        },
        GetString1: function (len)
        {
            if (this.cur + len > this.size)
                return "";
            var t = "";
            for (var i = 0; i < len; i++)
                t += String.fromCharCode(this.data[this.cur + i]);
            this.cur += len;
            return t;
        },
        ReadString1: function (len)
        {
            if (this.pos + len > this.size)
                return "";
            var t = "";
            for (var i = 0; i < len; i++)
                t += String.fromCharCode(this.data[this.pos + i]);
            this.pos += len;
            return t;
        },

        ReadUChar: function ()
        {
            if (this.pos >= this.size) {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            return this.data[this.pos++];
        },
        ReadChar: function ()
        {
            if (this.pos >= this.size) {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            var m = this.data[this.pos++];
            if (m > 127)
                m -= 256;
            return m;
        },

        // 2 byte
        GetUShort: function ()
        {
            if (this.cur + 1 >= this.size)
                return 0;
            return (this.data[this.cur++] << 8 | this.data[this.cur++]);
        },
        GetShort: function ()
        {
            return FT_Common.UShort_To_Short(this.GetUShort());
        },
        ReadUShort: function ()
        {
            if (this.pos + 1 >= this.size)
            {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            return (this.data[this.pos++] << 8 | this.data[this.pos++]);
        },
        ReadShort: function ()
        {
            return FT_Common.UShort_To_Short(this.ReadUShort());
        },
        GetUShortLE: function ()
        {
            if (this.cur + 1 >= this.size)
                return 0;
            return (this.data[this.cur++] | this.data[this.cur++] << 8);
        },
        GetShortLE: function ()
        {
            return FT_Common.UShort_To_Short(this.GetUShortLE());
        },
        ReadUShortLE: function ()
        {
            if (this.pos + 1 >= this.size) {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            return (this.data[this.pos++] | this.data[this.pos++] << 8);
        },
        ReadShortLE: function ()
        {
            return FT_Common.UShort_To_Short(this.ReadUShortLE());
        },

        // 4 byte
        GetULong: function ()
        {
            if (this.cur + 3 >= this.size)
                return 0;
            //return (this.data[this.cur++] << 24 | this.data[this.cur++] << 16 | this.data[this.cur++] << 8 | this.data[this.cur++]);
            var s = (this.data[this.cur++] << 24 | this.data[this.cur++] << 16 | this.data[this.cur++] << 8 | this.data[this.cur++]);
            if (s < 0)
                s += 4294967296;
            return s;
        },
        GetLong: function ()
        {
            // 32-битные числа - по умолчанию знаковые!!!
            //return FT_Common.UintToInt(this.GetULong());
            return (this.data[this.cur++] << 24 | this.data[this.cur++] << 16 | this.data[this.cur++] << 8 | this.data[this.cur++]);
        },
        ReadULong: function ()
        {
            if (this.pos + 3 >= this.size) {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            var s = (this.data[this.pos++] << 24 | this.data[this.pos++] << 16 | this.data[this.pos++] << 8 | this.data[this.pos++]);
            if (s < 0)
                s += 4294967296;
            return s;
        },
        ReadLong: function ()
        {
            // 32-битные числа - по умолчанию знаковые!!!
            //return FT_Common.Uint_To_int(this.ReadULong());
            if (this.pos + 3 >= this.size)
            {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            return (this.data[this.pos++] << 24 | this.data[this.pos++] << 16 | this.data[this.pos++] << 8 | this.data[this.pos++]);
        },

        GetULongLE: function ()
        {
            if (this.cur + 3 >= this.size)
                return 0;
            return (this.data[this.cur++] | this.data[this.cur++] << 8 | this.data[this.cur++] << 16 | this.data[this.cur++] << 24);
        },
        GetLongLE: function ()
        {
            return FT_Common.Uint_To_int(this.GetULongLE());
        },
        ReadULongLE: function ()
        {
            if (this.pos + 3 >= this.size)
            {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            return (this.data[this.pos++] | this.data[this.pos++] << 8 | this.data[this.pos++] << 16 | this.data[this.pos++] << 24);
        },
        ReadLongLE: function ()
        {
            return FT_Common.Uint_To_int(this.ReadULongLE());
        },

        // 3 byte
        GetUOffset: function ()
        {
            if (this.cur + 2 >= this.size)
                return 0;
            return (this.data[this.cur++] << 16 | this.data[this.cur++] << 8 | this.data[this.cur++]);
        },
        GetUOffsetLE: function ()
        {
            if (this.cur + 2 >= this.size)
                return 0;
            return (this.data[this.cur++] | this.data[this.cur++] << 8 | this.data[this.cur++] << 16);
        },
        ReadUOffset: function ()
        {
            if (this.pos + 2 >= this.size)
            {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            return (this.data[this.pos++] << 16 | this.data[this.pos++] << 8 | this.data[this.pos++]);
        },
        ReadUOffsetLE: function ()
        {
            if (this.pos + 2 >= this.size)
            {
                FT_Error = 85;
                return 0;
            }
            FT_Error = 0;
            return (this.data[this.pos++] | this.data[this.pos++] << 8 | this.data[this.pos++] << 16);
        }
    };

    function CPointer()
    {
        this.obj    = null;
        this.data   = null;
        this.pos    = 0;
    }
    function dublicate_pointer(p)
    {
        if (null == p)
            return null;

        var d = new CPointer();
        d.data = p.data;
        d.pos = p.pos;
        return d;
    }
    function copy_pointer(p, size)
    {
        var _p = g_memory.Alloc(size);
        for (var i = 0; i < size; i++)
            _p.data[i] = p.data[p.pos + i];
        return _p;
    }

    function FT_Memory()
    {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.ctx    = this.canvas.getContext('2d');

        this.Alloc = function(size)
        {
            var p = new CPointer();
            p.obj = this.ctx.createImageData(1,parseInt((size + 3) / 4));
            p.data = p.obj.data;
            p.pos = 0;
            return p;
        };
        this.AllocHeap = function()
        {
            // TODO: нужно посмотреть, как эта память будет использоваться.
            // нужно ли здесь делать стек, либо все время от нуля делать??
        };
        this.CreateStream = function(size)
        {
            var _size = parseInt((size + 3) / 4);
            var obj = this.ctx.createImageData(1,_size);
            return new FT_Stream(obj.data,_size);
        };
    }
    var g_memory = new FT_Memory();
    AscFonts.FT_Stream = FT_Stream;
    AscFonts.g_memory = g_memory;

    function CRasterMemory()
    {
        this.width = 0;
        this.height = 0;
        this.pitch = 0;

        this.m_oBuffer = null;
        this.CheckSize = function(w, h)
        {
            if (this.width < (w + 1) || this.height < (h + 1))
            {
                this.width = Math.max(this.width, w + 1);
                this.pitch = 4 * this.width;
                this.height = Math.max(this.height, h + 1);

                this.m_oBuffer = null;
                this.m_oBuffer = g_memory.ctx.createImageData(this.width, this.height);
            }
        };
    }
    AscFonts.raster_memory = new CRasterMemory();

    AscFonts.CreateLibrary = function()
    {
        return Module._ASC_FT_Init();
    };

    AscFonts.TT_INTERPRETER_VERSION_35 = 35;
    AscFonts.TT_INTERPRETER_VERSION_38 = 38;
    AscFonts.TT_INTERPRETER_VERSION_40 = 40;

    AscFonts.FT_Set_TrueType_HintProp = function(library, tt_interpreter)
    {
        return Module._ASC_FT_Set_TrueType_HintProp(library, tt_interpreter);
    };

    AscFonts.CreateNativeStream = function(_typed_array)
    {
        var _fontStreamPointer = Module._ASC_FT_Malloc(_typed_array.size);
        Module.HEAP8.set(_typed_array.data, _fontStreamPointer);
        return { asc_marker: true, data: _fontStreamPointer, len: _typed_array.size};
    };

    function CFaceInfo()
    {
        this.units_per_EM = 0;
        this.ascender = 0;
        this.descender = 0;
        this.height = 0;
        this.face_flags = 0;
        this.num_faces = 0;
        this.num_glyphs = 0;
        this.num_charmaps = 0;
        this.style_flags = 0;
        this.face_index = 0;

        this.family_name = "";

        this.style_name = "";

        this.os2_version = 0;
        this.os2_usWeightClass = 0;
        this.os2_fsSelection = 0;
        this.os2_usWinAscent = 0;
        this.os2_usWinDescent = 0;
        this.os2_usDefaultChar = 0;
        this.os2_sTypoAscender = 0;
        this.os2_sTypoDescender = 0;
        this.os2_sTypoLineGap = 0;

        this.os2_ulUnicodeRange1 = 0;
        this.os2_ulUnicodeRange2 = 0;
        this.os2_ulUnicodeRange3 = 0;
        this.os2_ulUnicodeRange4 = 0;
        this.os2_ulCodePageRange1 = 0;
        this.os2_ulCodePageRange2 = 0;

        this.os2_nSymbolic = 0;

        this.monochromeSizes = [];
    };

    CFaceInfo.prototype.load = function(face)
    {
        var _bufferPtr = Module._ASC_FT_GetFaceInfo(face);
        if (!_bufferPtr)
            return;

        var _buffer = new Int32Array(Module.HEAP8.buffer, _bufferPtr, 250); //max 230 symbols on name & style
        var _index = 0;

        this.units_per_EM 	= Math.abs(_buffer[_index++]);
        this.ascender 		= _buffer[_index++];
        this.descender 		= _buffer[_index++];
        this.height 		= _buffer[_index++];
        this.face_flags 	= _buffer[_index++];
        this.num_faces 		= _buffer[_index++];
        this.num_glyphs 	= _buffer[_index++];
        this.num_charmaps 	= _buffer[_index++];
        this.style_flags 	= _buffer[_index++];
        this.face_index 	= _buffer[_index++];

        var c = _buffer[_index++];
        while (c)
        {
            this.family_name += String.fromCharCode(c);
            c = _buffer[_index++];
        }

        c = _buffer[_index++];
        while (c)
        {
            this.style_name += String.fromCharCode(c);
            c = _buffer[_index++];
        }

        this.os2_version 		= _buffer[_index++];
        this.os2_usWeightClass 	= _buffer[_index++];
        this.os2_fsSelection 	= _buffer[_index++];
        this.os2_usWinAscent 	= _buffer[_index++];
        this.os2_usWinDescent 	= _buffer[_index++];
        this.os2_usDefaultChar 	= _buffer[_index++];
        this.os2_sTypoAscender 	= _buffer[_index++];
        this.os2_sTypoDescender = _buffer[_index++];
        this.os2_sTypoLineGap 	= _buffer[_index++];

        this.os2_ulUnicodeRange1 	= FT_Common.IntToUInt(_buffer[_index++]);
        this.os2_ulUnicodeRange2 	= FT_Common.IntToUInt(_buffer[_index++]);
        this.os2_ulUnicodeRange3 	= FT_Common.IntToUInt(_buffer[_index++]);
        this.os2_ulUnicodeRange4 	= FT_Common.IntToUInt(_buffer[_index++]);
        this.os2_ulCodePageRange1 	= FT_Common.IntToUInt(_buffer[_index++]);
        this.os2_ulCodePageRange2 	= FT_Common.IntToUInt(_buffer[_index++]);

        this.os2_nSymbolic 			= _buffer[_index++];

        var fixedSizesCount = _buffer[_index++];
        for (var i = 0; i < fixedSizesCount; i++)
            this.monochromeSizes.push(_buffer[_index++]);

        Module._ASC_FT_Free(_bufferPtr);
    };

    function CGlyphMetrics()
    {
        this.bbox_xMin = 0;
        this.bbox_yMin = 0;
        this.bbox_xMax = 0;
        this.bbox_yMax = 0;

        this.width          = 0;
        this.height         = 0;

        this.horiAdvance    = 0;
        this.horiBearingX   = 0;
        this.horiBearingY   = 0;

        this.vertAdvance    = 0;
        this.vertBearingX   = 0;
        this.vertBearingY   = 0;

        this.linearHoriAdvance = 0;
        this.linearVertAdvance = 0;
    }

    function CGlyphBitmapImage()
    {
        this.left   = 0;
        this.top    = 0;
        this.width  = 0;
        this.rows   = 0;
        this.pitch  = 0;
        this.mode   = 0;
    }

    AscFonts.CFaceInfo = CFaceInfo;
    AscFonts.CGlyphMetrics = CGlyphMetrics;
    AscFonts.CGlyphBitmapImage = CGlyphBitmapImage;

    AscFonts.FT_Open_Face = function(library, stream, face_index)
    {
        return Module._ASC_FT_Open_Face(library, stream.data, stream.len, face_index);
    };

    AscFonts.FT_Glyph_Get_Measure = function(face, vector_worker, painter)
    {
        var _bufferPtr = Module._ASC_FT_Get_Glyph_Measure_Params(face, vector_worker ? 1 : 0);
        if (!_bufferPtr)
            return null;

        var _len = 15;
        if (vector_worker)
            _len = Module.HEAP32[_bufferPtr >> 2];

        var _buffer = new Int32Array(Module.HEAP8.buffer, _bufferPtr, 4 * _len);

        var _info = new CGlyphMetrics();
        _info.bbox_xMin     = _buffer[1];
        _info.bbox_yMin     = _buffer[2];
        _info.bbox_xMax     = _buffer[3];
        _info.bbox_yMax     = _buffer[4];

        _info.width         = _buffer[5];
        _info.height        = _buffer[6];

        _info.horiAdvance   = _buffer[7];
        _info.horiBearingX  = _buffer[8];
        _info.horiBearingY  = _buffer[9];

        _info.vertAdvance   = _buffer[10];
        _info.vertBearingX  = _buffer[11];
        _info.vertBearingY  = _buffer[12];

        _info.linearHoriAdvance     = _buffer[13];
        _info.linearVertAdvance     = _buffer[14];

        if (vector_worker)
        {
            painter.start(vector_worker);

            var _pos = 15;
            while (_pos < _len)
            {
                switch (_buffer[_pos++])
                {
                    case 0:
                    {
                        painter._move_to(_buffer[_pos++], _buffer[_pos++], vector_worker);
                        break;
                    }
                    case 1:
                    {
                        painter._line_to(_buffer[_pos++], _buffer[_pos++], vector_worker);
                        break;
                    }
                    case 2:
                    {
                        painter._conic_to(_buffer[_pos++], _buffer[_pos++], _buffer[_pos++], _buffer[_pos++], vector_worker);
                        break;
                    }
                    case 3:
                    {
                        painter._cubic_to(_buffer[_pos++], _buffer[_pos++], _buffer[_pos++], _buffer[_pos++], _buffer[_pos++], _buffer[_pos++], vector_worker);
                        break;
                    }
                    default:
                        break;
                }
            }

            painter.end(vector_worker);
        }

        Module._ASC_FT_Free(_bufferPtr);
        _buffer = null;

        return _info;
    };

    AscFonts.FT_Glyph_Get_Raster = function(face, render_mode)
    {
        var _bufferPtr = Module._ASC_FT_Get_Glyph_Render_Params(face, render_mode);
        if (!_bufferPtr)
            return null;

        var _buffer = new Int32Array(Module.HEAP8.buffer, _bufferPtr, 24);

        var _info = new CGlyphBitmapImage();
        _info.left    = _buffer[0];
        _info.top     = _buffer[1];
        _info.width   = _buffer[2];
        _info.rows    = _buffer[3];
        _info.pitch   = _buffer[4];
        _info.mode    = _buffer[5];

        Module._ASC_FT_Free(_bufferPtr);
        return _info;
    };

    AscFonts.FT_Load_Glyph = Module._FT_Load_Glyph;
    AscFonts.FT_Set_Transform = Module._ASC_FT_Set_Transform;
    AscFonts.FT_Set_Char_Size = Module._FT_Set_Char_Size;

    AscFonts.FT_SetCMapForCharCode = Module._ASC_FT_SetCMapForCharCode;
    AscFonts.FT_GetKerningX = Module._ASC_FT_GetKerningX;
    AscFonts.FT_GetFaceMaxAdvanceX = Module._ASC_FT_GetFaceMaxAdvanceX;
    AscFonts.FT_Get_Glyph_Render_Buffer = function(face, rasterInfo, isCopyToRasterMemory)
    {
        var _bufferPtr = Module._ASC_FT_Get_Glyph_Render_Buffer(face);
        var tmp = new Uint8Array(Module.HEAP8.buffer, _bufferPtr, rasterInfo.pitch * rasterInfo.rows);

        if (!isCopyToRasterMemory)
            return tmp;

        AscFonts.raster_memory.CheckSize(rasterInfo.width, rasterInfo.rows);

        var offsetSrc = 0;
        var offsetDst = 3;
        var dstData = AscFonts.raster_memory.m_oBuffer.data;

        if (rasterInfo.pitch >= rasterInfo.width)
		{
			for (var j = 0; j < rasterInfo.rows; ++j, offsetSrc += rasterInfo.pitch)
			{
				offsetDst = 3 + j * AscFonts.raster_memory.pitch;
				for (var i = 0; i < rasterInfo.width; i++, offsetDst += 4)
				{
					dstData[offsetDst] = tmp[offsetSrc + i];
				}
			}
		}
		else
        {
            var bitNumber = 0;
            var byteNumber = 0;
			for (var j = 0; j < rasterInfo.rows; ++j, offsetSrc += rasterInfo.pitch)
			{
				offsetDst = 3 + j * AscFonts.raster_memory.pitch;
				bitNumber = 0;
				byteNumber = 0;
				for (var i = 0; i < rasterInfo.width; i++, offsetDst += 4, bitNumber++)
				{
				    if (8 == bitNumber)
                    {
                        bitNumber = 0;
                        byteNumber++;
                    }
					dstData[offsetDst] = (tmp[offsetSrc + byteNumber] & (1 << (7 - bitNumber))) ? 255 : 0;
				}
			}
        }

        tmp = null;
    };

    AscFonts.FT_Common = FT_Common;

})(window, undefined);