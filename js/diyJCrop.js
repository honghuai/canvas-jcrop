/**
 *diyJCrop.js
 *@author honghuai
 * @created 2016-02-17 10:31.
 */
var putPhoto = function() {};
putPhoto.prototype = {
    toRender : function (src) {
        //渲染图片并压缩-canvas
        var MAX_HEIGHT = 600;
        var image = new Image();
        var me = this;
        image.onload = function () {
            var canvas = document.createElement("canvas");
            //canvas.style.cssText = "width:300px;height:300px;";
            //canvas.className = "singlePhoto";
            //document.getElementById("photoList").appendChild(canvas);
            if (image.height > MAX_HEIGHT) {
                image.width *= MAX_HEIGHT / image.height;
                image.height = MAX_HEIGHT;
            }
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0, image.width, image.height);
            var base64 = canvas.toDataURL('image/jpeg', 0.6);//toDataURL类型及其压缩质量
            //console.log(base64);
            me.insertImg(base64);//显示压缩后的图片
        };
        image.src = src;
    },
    loadImage : function (src) {
        //加载图像文件(url路径)
        if(!src) {
            return;
        }
        if (!src.type.match(/image.*/)) {
            if (window.console) {
                console.log("选择的文件类型不是图片: ", src.type);
            }
            else {
                window.confirm("只能选择图片文件");
            }
            return;
        }
        var reader = new FileReader();
        var me = this;
        reader.onload = function (e) {
            me.toRender(e.target.result);
        };
        // 读取文件内容
        reader.readAsDataURL(src);
    },
    insertImg : function (src) {
        //插入图片
        document.getElementById("wrapPic").innerHTML = '<img class="singlePhoto" src="' + src + '" name = "base64files" id="target" alt="[Jcrop Example]" style="max-height:600px;" alt=""/>';;
        this.showJCrop(src,100,130);
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
        //console.log(imgPrototype);
        return imgPrototype;
    },
    showJCrop:function(src,xsize,ysize){
        console.log('init',[xsize,ysize]);
        $('#target').Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            aspectRatio: xsize / ysize
        });

        function updatePreview(c)
        {
            //console.log("  宽度="+ c.w+"高度="+ c.h+ " x轴="+ c.x +" y轴="+ c.y);

            /*自定义预览效果*/
            //获取Canvas对象(画布)
            var canvas = document.getElementById("myCanvas");
            //简单地检测当前浏览器是否支持Canvas对象，以免在一些不支持html5的浏览器中提示语法错误
            if(canvas.getContext){
                //获取对应的CanvasRenderingContext2D对象(画笔)
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0,0,canvas.width,canvas.height);
                //创建新的图片对象
                var img = new Image();
                //指定图片的URL
                img.src = src;
                var MAX_HEIGHT = "600";
                if (img.height > MAX_HEIGHT) {//比例化图片宽高，避免图片过大裁剪bug
                    img.width *= MAX_HEIGHT / image.height;
                    img.height = MAX_HEIGHT;
                }
                canvas.width = xsize;
                canvas.height = ysize;
                //浏览器加载图片完毕后再绘制图片
                img.onload = function(){
                    //console.log("  宽度="+ c.w+"高度="+ c.h+ " x轴="+ c.x +" y轴="+ c.y);
                    //以Canvas画布上的坐标(0,0)为起始点,宽度为canvas.width,高度为canvas.height，绘制原图像中以c.x为x轴，c.y为y轴，宽度为c.w，高度为c.h的部分图像
                    ctx.drawImage(img,c.x,c.y,c.w,c.h,0,0,canvas.width,canvas.height);
                    var base64 = canvas.toDataURL('image/jpeg', 1);//toDataURL类型及其压缩质量
                    document.getElementById("canvasLastImg").src = base64;
                };
            }
            /*end*/
        };
    }
}
putPhoto = new putPhoto();
$("#loadPicWrap").delegate(".loadFile","change",function(e) {
   /* putPhoto.insertImg = function (src) {
        //插入图片,根据需求，可能需要传图片的其他属性，如图片后缀，图片名字，图片格式等信息到后台，可以在此处重写插入图片方法
        var imgPrototype = this.getImgPrototype($(".loadFile").get(0));
        var insertConn =
            '<img class="singlePhoto" src="' + src + '" name = "base64files" id="target" alt="[Jcrop Example]" style="max-height:600px;" alt=""/>'
            + '<input type="hidden" name = "filenames" value = "'+imgPrototype.filenames+'">';
        document.getElementById("wrapPic").innerHTML = insertConn;
        this.showJCrop(src,100,130);
    }*/
    var file = e.target.files[0];
    putPhoto.loadImage(file);
})
/*$("#canvasLastImg").attr("src")即为裁剪后的图片base64编码，直接传到后台，完毕*/
/*接口执行处*/
$("#uploadRstPic").click(function() {
    var URL = server + "/resources/xsa/documents/uploadBase64";
    var base64files = $("#canvasLastImg").attr("src");
    var uploadJson = {
        description: "用户头像",
        entityName: "USERMANAGE",
        publishFlag: "1",
        filenames: $("#target").attr("filenames"),
        base64files: base64files
    }
    $.ajax({
        method: "POST",
        url: URL,
        data: uploadJson,
        dataType: "json"
    }).done(function(data) {
        console.log(data);
        console.log(data.rows.url)
    }).fail(function(data) {
        alert("请求失败");
    }).always(function() {
    });

})