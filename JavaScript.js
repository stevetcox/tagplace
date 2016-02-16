var first_time, error;
var logged_in, currentPos;
var from_tag_marker;
var input, searchBox, width, height;
var map, clusterer, bubble, geocoder, giw;
var marker;
var service;
var markers = [];
var places = [];
var tags = [];
var grouped_tags;
logged_in = Appery.storage.logged_in.get();

function onGeoSuccess(a) {
    currentPos = {
        lat: a.coords.latitude,
        lng: a.coords.longitude
    };
    Appery.storage.last_location.set({
        Latitude: a.coords.latitude,
        Longitude: a.coords.longitude
    });
    if (map) {
        map.setCenter(new google.maps.LatLng(a.coords.latitude, a.coords.longitude))
    }
}

function onGeoError(a) {}

function getgeo() {
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
        maximumAge: 60000
    })
}
getgeo();
var default_location = {
    Latitude: 39.833333,
    Longitude: -98.583333
};
var last_location = Apperyio.storage.last_location.get();
if (last_location) {
    default_location = last_location
}
var default_LatLng = new google.maps.LatLng(default_location.Latitude, default_location.Longitude);

function initialize() {
    geocoder = new google.maps.Geocoder();
    var e = {
        center: default_LatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 16,
        disableDefaultUI: true,
        width: $(window).width(),
        height: $(window).height()
    };
    map = new google.maps.Map(document.getElementById("map"), e);
    var a = map.getStreetView();
    google.maps.event.addListener(a, "visible_changed", function() {
        if (a.getVisible()) {
            $(".controlgrid").hide();
            $(".locatecontrol").hide()
        } else {
            $(".controlgrid").show();
            $(".locatecontrol").show()
        }
    });
    var b = document.getElementById("UI_place_search_input");
    searchBox = new google.maps.places.SearchBox(b);
    google.maps.event.addListener(searchBox, "places_changed", function() {
        b.blur();
        if (clusterer) {
            clusterer.removeMarkers(markers)
        }
        for (var l = 0, g; markers[l]; l++) {
            g = markers[l];
            g.setMap(null)
        }
        while (markers.length > 0) {
            markers.pop()
        }
        markers = [];
        while (places.length > 0) {
            places.pop()
        }
        places = [];
        Appery("resultsList").empty();
        places = searchBox.getPlaces();
        Appery.storage.places.set(places);
        if (places.length === 0) {
            return
        }
        var f = new google.maps.LatLngBounds();
        bubble = new InfoBubble({
            content: "",
            shadowStyle: 0,
            borderRadius: 5
        });
        Appery("results_list").empty();

        function h() {
            $("#map > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(4)").find(".gm-style-iw").parent().css("visibility", "hidden").refresh();
            Appery.storage.from_tag_marker.set(false);
            Appery.storage.from_g_bubble.set(false);
            var i = $(this.html).find("#ibtitle").attr("place_id");
            bubble.setContent(this.html);
            Appery.storage.marker.set({
                google_id: i,
                location: [this.position.B, this.position.k],
                name: this.labelContent
            });
            Appery("place_name_label").text(this.labelContent);
            marker = this;
            tag_settings.places_where = '{"place_id":"' + i + '"}';
            place_query_service.execute();
            var q = this.position;
            if (Math.round10(q.B, -6) == Math.round10(map.getCenter().B, -6) && Math.round10(q.k, -6) == Math.round10(map.getCenter().k, -6)) {} else {
                map.setCenter(q)
            }
        }
        for (l = 0; places[l]; l++) {
            var k = places[l];
            var j = {
                url: "files/views/assets/image/marker1.png",
                scaledSize: new google.maps.Size(20, 20)
            };
            var n = new MarkerWithLabel({
                map: map,
                icon: j,
                position: k.geometry.location,
                html: ibHTML(k.name, k.place_id),
                labelContent: k.name,
                labelClass: "maptag-label",
                labelAnchor: new google.maps.Point(0, 20),
                labelStyle: {
                    opacity: 1
                }
            });
            google.maps.event.addListener(n, "click", h);
            markers.push(n);
            f.extend(k.geometry.location)
        }
        var o;
        var p = [];
        for (l = 0; places[l]; l++) {
            o = places[l];
            p.push(results_item_create(o))
        }
        Appery("results_list").empty();
        Appery("results_list").append(p.join("")).listview("refresh");
        var m = {
            gridSize: 60,
            maxZoom: 16,
            minZoom: 10,
            averageCenter: true,
            minimumClusterSize: 6,
            enableRetinaIcons: false,
            ignoreHidden: true
        };
        clusterer = new MarkerClusterer(map, [], m);
        clusterer.addMarkers(markers)
    });
    google.maps.event.addListener(map, "bounds_changed", function() {
        var f = map.getBounds();
        searchBox.setBounds(f);
        Appery("slider").val(map.getZoom()).refresh()
    });

    function d(g) {
        var h = g[0].added;
        var f;
        if (h.length !== 0) {
            f = $(h[h.length - 1].parentNode);
            if (f[0].lastChild.className !== "tp-tags") {
                if (bubble) {
                    bubble.close()
                }
                $(f).append('<div class="tp-tags"></div>');
                Appery.storage.gm_title.set($(f).children(".gm-title").text());
                Appery.storage.gm_addr.set($(f).children(".gm-basicinfo").children(".gm-addr").text());
                geocoder.geocode({
                    address: Appery.storage.gm_addr.get(),
                    bounds: map.getBounds()
                }, function(j, i) {
                    function l(o, n) {
                        if (n == google.maps.places.PlacesServiceStatus.OK) {
                            var m = o[0].place_id;
                            Appery.storage.marker.set({
                                google_id: m,
                                location: [o[0].geometry.location.B, o[0].geometry.location.k],
                                name: o[0].name
                            });
                            Appery("place_name_label").text(o[0].name);
                            tag_settings.places_where = '{"place_id":"' + m + '"}';
                            Appery.storage.from_g_bubble.set(true);
                            Appery.storage.from_tag_marker.set(false);
                            place_query_service.execute()
                        }
                    }
                    if (i == google.maps.GeocoderStatus.OK) {
                        var k = {
                            location: j[0].geometry.location,
                            keyword: Appery.storage.gm_title.get(),
                            rankBy: google.maps.places.RankBy.DISTANCE
                        };
                        service = new google.maps.places.PlacesService(map);
                        service.nearbySearch(k, l)
                    } else {
                        console.log("geocode: " + i)
                    }
                })
            }
        }
    }
    var c = new MutationSummary({
        callback: d,
        queries: [{
            element: ".gm-rev"
        }]
    })
};