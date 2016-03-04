/**
 *index.js
 *@author honghuai
 * @created 2016-02-26 18:54.
 */
var putPhoto;
$("#showPutBox").click(function(){
    var preVId = "canvasLastImg";
    var cssTxtTitle = "font-size:16px;line-height: 40px;height: 40px;padding-left: 10px;color: #fff;background-color:#f40;";
    var cssPutBoxConn = '<div class="tip-uploadWrap"><div class="tip-upload">本地上传</div><input type="file" id="loadFileId" class="loadFile" accept="image/*" capture="camera"></div>'+
        '<div id="wrapPic" style="margin-top:10px;"></div>'+
        '<br/>'+
        '<div class="preViewBox"><img src="" alt="" id="'+preVId+'" class="tpl-img-put"><span style="line-height: 35px;display:block;">预览效果</span></div>';
    layer.confirm("",{
        content:cssPutBoxConn,
        btn:["确认","取消"],
        closeBtn: 1,
        area: ['660px', 'auto'],
        title:["上传头像",cssTxtTitle]
    },function(index) {
        uploadRstPhoto();
    },function() {
    })
    //$("body").html(cssPutBoxConn); //此处是另一种表示方法，移动端不采用layer.js方法
    if(typeof putPhoto !== "object") {//需要对putPhoto进行判断，首次new实例化对象方法，之后因为存在该对象方法不需要重新new
        putPhoto = new putPhoto({
            MAX_HEIGHT:400,
            MAX_WIDTH:400,
            el:"Target",
            toEl: preVId,
            jcrop: true
        });
        putPhoto.insertImg = function(src) {//重写插入图片方法
            $("#wrapPic").html("");
            var targetId = this.el;
            if(this.el === "" || this.el === undefined) {
                targetId = "target"+new Date().getTime();//对象id
                console.log("为空或undefined判定");
            }

            var imgPrototype = this.getImgPrototype($(".loadFile").get(0));
            $("#wrapPic").html('<img src="'+src+'" name="base64files" class="singlePhoto" filenames="'+imgPrototype.filenames+'" id="'+targetId+'" >');
            $(".preViewBox").show();
            var H =parseInt($("#Target").height()) + 80;
            $(".layui-layer-content").height(H);
            $(".layui-layer").css({"top":"270px"});
            this.showJCrop(targetId,src);//预览id为targetId的图片尺寸
        }
    }
    /*应用场景1：直接获取原图base64编码*/
    /*putPhoto.loadImage("loadFileId",function(src) {
        console.log(src);
    });*/

    /*应用场景2：压缩处理后输出图片
     * putPhoto.toRender(ElId,callback);
     * callback回调方法:可选，主要对处理过的src进行赋值及其他操作
     * */
    /*putPhoto.toRender("loadFileId",function(src) {
        putPhoto.insertImg(src);
    });*/
    putPhoto.toRender("loadFileId");
})
/*上传接口方法*/
function uploadRstPhoto() {
    var URL = "/resources/xsa/documents/uploadBase64";
    var base64files = $("#canvasLastImg").attr("src");
    if(!base64files) {return;}
    var uploadJson = {
        description: "用户头像",
        entityName: "USERMANAGE",
        publishFlag: "1",
        filenames: $("#Target").attr("filenames"),
        base64files: base64files
    }
    if(!base64files){
        return;
    }
    $.ajax({
        method: "POST",
        url: URL,
        data: uploadJson,
        dataType: "json"
    }).done(function(data) {
        console.log(data);
        var imgURL = data.rows.url;
        $(".mt-user-avatar img").attr('src',imgURL);
        $("#photo_img").attr('src',imgURL);
        $('#documentPath').val(imgURL);
        layer.closeAll();
    }).fail(function(data) {
        layer.msg("头像上传请求失败，请重试！", {icon: 2});
    }).always(function() {
    });
}