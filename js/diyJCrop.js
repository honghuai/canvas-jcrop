/**
 *diyJCrop.js
 *@author honghuai
 * @created 2016-02-17 10:31.
 */
var putPhoto = function(o) {
    var origin = {//默认值
        MAX_WIDTH: 400,//裁剪图片的最大高度
        MAX_HEIGHT: 400,//裁剪图片的最大宽度
        xsize: 100,//预览图片的宽度
        ysize: 110,//预览图片的高度
        compression: 0.7,//图片压缩比例(原图)
        partCompression: 1,//二次压缩比例（裁剪后那部分图片）
        el:"",//必须是标签id，若没指定id则系统自动设置id = target+时间戳
        toEl:""//预览图片的id
    }
    if(!o){
        var o = origin;
    }
    if(/^\d+$/.test(parseInt(o.el)) || /^\d+$/.test(parseInt(o.toEl))) {
        alert("裁剪标签的ID不能设置为纯数字类型");
        this.error = true;
        return;
    }
    for(k in origin) {
        if(!o[k]) {
            o[k] = origin[k];
        }
        this[k] = o[k];
    }
};

putPhoto.prototype = {
    toRender : function (src) {
        //渲染图片并压缩-canvas
        var MAX_HEIGHT = this.MAX_HEIGHT;
        var MAX_WIDTH = this.MAX_WIDTH;
        var image = new Image();
        var me = this;
        image.onload = function () {
            /*图片宽高按照一定比例变化*/
            if (image.height > MAX_HEIGHT) {
                image.width *= MAX_HEIGHT / image.height;
                image.height = MAX_HEIGHT;
                if(image.width > MAX_WIDTH) {
                    image.height *= MAX_WIDTH/image.width;
                    image.width = MAX_WIDTH;
                }
            }

            if (image.width > MAX_WIDTH) {
                image.height *= MAX_WIDTH/image.width;
                image.width = MAX_WIDTH;
                if(image.height > MAX_HEIGHT) {
                    image.width *= MAX_HEIGHT/image.height;
                    image.height = MAX_HEIGHT;
                }
            }
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            var base64 = canvas.toDataURL('image/jpeg', me.compression);//toDataURL类型及其压缩质量
            me.insertImg(base64);//插入压缩后的图片
        };
        image.src = src;
    },
    loadImage : function (el) {
        var me = this;
        //document.getElementById(el).onchange = function(e) {
        var el = "#"+el;
        $("body").delegate(el,"change",function(e){
            if(me.error) { return; }
            var _file = e.target.files[0];
            //加载图像文件(url路径)
            if(!_file) {
                return;
            }
            if (!_file.type.match(/image.*/)) {
                if (window.console) {
                    console.log("选择的文件类型不是图片: ", _file.type);
                }
                else {
                    window.confirm("只能选择图片文件");
                }
                return;
            }
            var reader = new FileReader();

            reader.onload = function (e) {
                me.toRender(e.target.result);
            };
            // 读取文件内容
            reader.readAsDataURL(_file);
        })
    },
    insertImg : function (src) {
        //插入图片
        var IMAGE = new Image();
        var targetId = this.el;
        if(this.el === "" || this.el === undefined) {
            targetId = "target"+new Date().getTime();//对象id
            console.log("为空或undefined判定");
        }

        var imgPrototype = this.getImgPrototype($(".loadFile").get(0));
        console.log(imgPrototype);

        if(document.getElementById("wrapPic").innerHTML === "") {
            IMAGE.id = targetId;
            IMAGE.src = src;
            IMAGE.className = "singlePhoto";
            IMAGE.name = "base64files";
            document.getElementById("wrapPic").appendChild(IMAGE);
        } else {
            document.getElementById(targetId).src = src;
        }

        this.showJCrop(targetId,src);//预览id为targetId的图片尺寸
    },
    getImgPrototype : function (Target) {
        /*用途：获取图片文件格式及其后缀
         * 使用方法：
         * var putPhoto = new putPhoto();
         * putPhoto.getImgPrototype(e);//参数e表示input[type=file]标签的id
         * 返回值：一个imgPrototype对象，其中属性filenames为图片原名，suffixName为后缀名，type为格式
         * */
        //var file = e.target.files[0];
        //var filename = e.target.value;
        var file = Target.files[0];
        var filename = Target.value;
        var filenames = filename.substring(filename.lastIndexOf("\\") + 1);
        var suffixName = filename.substring(filename.lastIndexOf(".") + 1);
        var imgPrototype = {
            filenames : filenames,
            suffixName : suffixName,
            type : file.type
        }
        return imgPrototype;
    },
    showJCrop:function(targetId,src){
        var me = this;
        var xsize = this.xsize;
        var ysize = this.ysize;
        var partCompression = this.partCompression;
        console.log('init',[xsize,ysize]);
        $("#"+targetId).Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            aspectRatio: xsize / ysize
        });

        function updatePreview(c)
        {
            //console.log("  宽度="+ c.w+"高度="+ c.h+ " x轴="+ c.x +" y轴="+ c.y);
            /*自定义预览效果start*/
            //获取Canvas对象(画布)
            var canvas = document.createElement("canvas");
            canvas.id = "myCanvas";
            //简单地检测当前浏览器是否支持Canvas对象，以免在一些不支持html5的浏览器中提示语法错误
            if(canvas.getContext){
                //获取对应的CanvasRenderingContext2D对象(画笔)
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0,0,canvas.width,canvas.height);
                //创建新的图片对象
                var img = new Image();
                //指定图片的URL
                img.src = src;
                canvas.width = xsize;
                canvas.height = ysize;
                //浏览器加载图片完毕后再绘制图片
                img.onload = function(){
                    //console.log("  宽度="+ c.w+"高度="+ c.h+ " x轴="+ c.x +" y轴="+ c.y);
                    //以Canvas画布上的坐标(0,0)为起始点,宽度为canvas.width,高度为canvas.height，绘制原图像中以c.x为x轴，c.y为y轴，宽度为c.w，高度为c.h的部分图像
                    ctx.drawImage(img,c.x,c.y,c.w,c.h,0,0,canvas.width,canvas.height);
                    var base64 = canvas.toDataURL('image/jpeg', partCompression);//toDataURL类型及其压缩质量
                    document.getElementById(me.toEl).src = base64;
                };
            }
            /*end*/
        };
    }
}
