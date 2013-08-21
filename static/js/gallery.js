$(document).ready(function() {

    var photoList = null;
    var lastWidth = 0;

    var g = new Gallery();

    // only call this when either the data is loaded, or the windows resizes by a chunk
    var resize = function() {
        lastWidth = $("div#picstest").innerWidth();
        $("div.picrow").width(lastWidth);
        g.processPhotos(photoList);
    };

    var loading = false;

    var nextPage = 1;
    var itemsPerPage = 20;

    function loadNext(cb) {
        if(!loading) {
            loading = true;

            var from = (nextPage-1) * itemsPerPage;
            var to = from + itemsPerPage;

            $.getJSON("/api/list/all/"+from+"/"+to, null, function(data, status) {
                if(data && data.length > 0) {
                    g.processPhotos(data, function() {
                        loading = false;
                        nextPage ++;

                        if(endReached()) {
                            loadNext(cb);
                        }
                    });
                }
            }).error(function() {
                loading = false;
                if(cb) {
                    cb();
                }
            });

        }
    }

    $(window).scroll(function() {
        if(endReached()) {
            loadNext();
        }
    });

    function endReached() {
        return ($(window).scrollTop() + $(window).height() > $(document).height() - 100);
    }

    loadNext();

});

function Gallery() {

    // initial height - effectively the maximum height +/- 10%;
    var h = parseInt($(window).height() / 2);
    // margin width
    var border = 5;

    // total number of images appearing in all previous rows
//    var baseLine = 0;

    var placeHolder = $("#picturesPlaceHolder");

    this.processPhotos = function(photos, callback) {
        // divs to contain the images
//        var divRows = $("div.picrow");

        // get row width - this is fixed.
        var w = placeHolder.innerWidth();

        // store relative widths of all images (scaled to match estimate height above)
        var ws = [];
        $.each(photos, function(key, val) {

            var wt = parseInt(val.width, 10);
            var ht = parseInt(val.height, 10);

            if( ht != h ) { wt = Math.floor(wt * (h / ht)); }
            ws.push(wt);
        });

//        for(var rowNum = 0 ; rowNum < divRows.length ; rowNum ++) {
//            var row = divRows.eq(rowNum);
//            row.empty();

        var morePhotos = true;

        var count = 0;
        var baseLine = 0;

        var imagesLoaded = 0;

        while(baseLine < photos.length) {

            //console.log(baseLine + ", "+photos.length)

            count++

            var row = $('<div></div>', {class: "picrow"});
            placeHolder.append(row);

            // number of images appearing in this row
            var imagesCountInRow = 0;
            // total width of images in this row - including margins
            var tw = 0;

            // calculate width of images and number of images to view in this row.
            while( tw * 1.1 < w)
            {
                if(ws[baseLine + imagesCountInRow]) {
                    tw += ws[baseLine + imagesCountInRow] + border * 2;
                    imagesCountInRow ++;
                } else {
                    break;
                }


            }

            // Ratio of actual width of row to total width of images to be used.
            var r = w / tw;

            // reset total width to be total width of processed images
            tw = 0;

            // new height is not original height * ratio
            var ht = Math.floor(h * r);

            for( var i = 0 ; i < imagesCountInRow ; i++) {
                var photo = photos[baseLine + i];
                if(!photo) {
                    break;
                }

                // Calculate new width based on ratio
                var wt = Math.floor(ws[baseLine + i] * r);

                // add to total width with margins
                tw += wt + border * 2;

                //console.log("photo: "+(baseLine + i)+", row:"+i)
                //console.log("("+(baseLine + i)+")"+photo.name + ": w="+wt + ", h="+ht);

                // Create image, set src, width, height and margin
                (function() {
                    var thumbnailUrl = "/api/image/" + photo.uid + "?width=" + wt + "&height="+ht;
                    var photoUrl = "/api/image/" + photo.uid;
                    var img = $('<img/>', {class: "photo", src: thumbnailUrl, width: wt, height: ht}).css("margin", border + "px");

                    var lightBox = createLightbox(photo);

                    $("body").append(lightBox);

                    img.click(function() {
                        lightBox.show();
                    });

                    row.append(img);
                    img.load(function() {
                        imagesLoaded ++

                        if(imagesLoaded == photos.length) {
                            if(callback) {
                                callback();
                            }
                        }
                    })
                })();
            }

            // if total width is slightly smaller than
            // actual div width then add 1 to each
            // photo width till they match
            var imageNumber = 0;
            while( tw < w )
            {
                var img1 = row.find("img:nth-child(" + (imageNumber + 1) + ")");
                img1.width(img1.width() + 1);
                imageNumber = (imageNumber + 1) % imagesCountInRow;
                tw++;
            }
            // if total width is slightly bigger than
            // actual div width then subtract 1 from each
            // photo width till they match
            imageNumber = 0;
            while( tw > w )
            {
                var img2 = row.find("img:nth-child(" + (imageNumber + 1) + ")");
                img2.width(img2.width() - 1);
                imageNumber = (imageNumber + 1) % imagesCountInRow;
                tw--;
            }

            // set row height to actual height + margins
            row.height(ht + border * 2);

            baseLine += imagesCountInRow;
        }
    }

    function createLightbox(photo) {

        var lightboxDiv = $('<div/>', {class: "lightbox"});
        var topInfo = $('<div class="title">'+photo.name+'</div>');
        var content = $('<div></div>');

        var alreadyMadeVisible = false;

        var img = $('<img/>', {src: "api/image/"+photo.uid, class: "photo"});

        lightboxDiv.append('<p>click to close</p>');
        lightboxDiv.append(topInfo);
        lightboxDiv.append(content);

        lightboxDiv.click(function(e) {
            lightboxDiv.hide();
        });
        lightboxDiv.hide();

        // lazy load of image when showing so that loading it is not blocking the display of the lightbox
        var _show = lightboxDiv.show;
        lightboxDiv.show = function() {
            _show.apply(lightboxDiv);
            if(!alreadyMadeVisible) {
                alreadyMadeVisible = true;
                setTimeout(function() {
                    content.append(img);
                }, 20)
            }
        }

        return lightboxDiv;
    }
}

