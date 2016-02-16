function locateControl_onClick(a) {
    if (map) {
        var b = new google.maps.LatLng(Apperyio.storage.last_location.get("$['Latitude']"), Apperyio.storage.last_location.get("$['Longitude']"));
        map.setCenter(b)
    }
}

function tag_name_save_on_click(c) {
    Appery("tag_name_input").blur();
    var b = c.id.split("_")[4];
    var a = Appery.storage.place_tags.get("$[" + b + "]");
    a.name = Appery("tag_name_input_" + b).val();
    Appery.storage.place_tag.set(a);
    Appery("tag_name_label_" + b).text(a.name).show();
    Appery("tag_name_grid_" + b).hide();
    tag_update_service.execute();
    event.preventDefault()
}

function tag_name_label_on_click(b) {
    var a = b.id.split("_")[4];
    Appery("tag_name_label_" + a).hide();
    Appery("tag_name_input_" + a).val(Appery("tag_name_label_" + a).text()).show();
    Appery("tag_name_grid_" + a).show();
    event.preventDefault()
}

function tag_name_cancel_on_click(b) {
    var a = b.id.split("_")[4];
    Appery("tag_name_grid_" + a).hide();
    Appery("tag_name_label_" + a).show();
    event.preventDefault()
}

function tag_list_delete_button_on_click(b) {
    var a = b.id.split("_")[4];
    if (confirm("Delete tag: " + Appery("tag_name_label_" + a).text() + "?") === true) {
        Appery.storage.tag_id_label.set(Appery("tag_id_label_" + a).text());
        tag_delete_service.execute()
    }
}

function add_tag_name_input_on_value_change(a) {
    Appery.storage.tag_name_label.set(Appery("add_tag_name_input").val());
    Appery("add_tag_name_input").val("").blur();
    tag_create_service.execute()
}

function tag_query_service_on_success(f) {
    Appery.storage.from_tag_marker.set(true);
    if (clusterer) {
        clusterer.removeMarkers(markers)
    }
    for (var g = 0, c; markers[g]; g++) {
        c = markers[g];
        c.setMap(null)
    }
    while (markers.length > 0) {
        markers.pop()
    }
    markers = [];
    tags = Appery.storage.tags.get();
    if (tags.length === 0) {
        return
    }
    var a = new google.maps.LatLngBounds();
    bubble = new InfoBubble({
        content: "",
        shadowStyle: 0,
        borderRadius: 5
    });

    function b() {
        $("#map > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(4)").find(".gm-style-iw").parent().css("visibility", "hidden").refresh();
        Appery.storage.from_tag_marker.set(true);
        Appery.storage.from_g_bubble.set(false);
        var p = $(this.html).find("#ibtitle").attr("place_id");
        bubble.setContent(this.html);
        Appery.storage.marker.set({
            google_id: p,
            location: [this.position.B, this.position.k],
            name: this.labelContent
        });
        Appery("place_name_label").text(this.labelContent);
        marker = this;
        tag_settings.places_where = '{"place_id":"' + p + '"}';
        place_query_service.execute();
        var q = this.position;
        if (Math.round10(q.B, -6) == Math.round10(map.getCenter().B, -6) && Math.round10(q.k, -6) == Math.round10(map.getCenter().k, -6)) {} else {
            map.setCenter(q)
        }
    }
    var d = [],
        n = [];
    for (g = 0; tags[g]; g++) {
        if (d[tags[g].place_id]) {
            continue
        }
        d[tags[g].place_id] = true;
        n.push({
            location: tags[g].location,
            place_name: tags[g].place_name,
            place_id: tags[g].place_id
        })
    }
    for (g = 0; n[g]; g++) {
        var j = n[g];
        var e = {
            url: "files/views/assets/image/marker1.png",
            scaledSize: new google.maps.Size(20, 20)
        };
        var k = new MarkerWithLabel({
            map: map,
            icon: e,
            position: new google.maps.LatLng(j.location[1], j.location[0]),
            html: ibHTML(j.place_name, j.place_id),
            labelContent: j.place_name,
            labelClass: "maptag-label",
            labelAnchor: new google.maps.Point(0, 0),
            labelStyle: {
                opacity: 0.8
            }
        });
        google.maps.event.addListener(k, "click", b);
        markers.push(k);
        a.extend(new google.maps.LatLng(j.location[1], j.location[0]))
    }
    var l = [];
    var m = _.groupBy(tags, "place_id");
    for (var o in m) {
        l.push(results_item_create(m[o]))
    }
    console.log("grouped_tags, tag_list");
    console.dir(m);
    console.dir(l);
    Appery("results_list").empty();
    Appery("results_list").append(l.join("")).listview("refresh");
    var h = {
        gridSize: 60,
        maxZoom: 16,
        minZoom: 10,
        averageCenter: true,
        minimumClusterSize: 6,
        enableRetinaIcons: false,
        ignoreHidden: true
    };
    clusterer = new MarkerClusterer(map, [], h);
    clusterer.addMarkers(markers);
    map.fitBounds(a);
    if (map.getZoom() > 16) {
        map.setZoom(16)
    }
}

function tag_search_input_on_search(c) {
    Appery.storage.tag_search_value.set(c.value);
    var a = c.value;
    Appery("tag_search_input").val("");
    Appery("tag_search_input").blur();
    var b = map.getBounds();
    tag_settings.tags_where = '{"$and": [{"location" : {"$within" : {"$box" : [[' + b.va.j + "," + b.Ea.k + "],[" + b.va.k + "," + b.Ea.j + ']]}}},{"tag": {"$regex" : ".*' + a + '", "$options": "i"}}]}';
    tag_query_service.execute()
}

function tag_edit_on_click() {
    Appery("tagsPanel").panel("open")
}

function tag_panel_close_on_click() {
    Appery("tagsPanel").panel("close")
}

function results_panel_close_on_click() {
    Appery("resultsPanel").panel("close")
}

function close_open_bubbles() {
    $("#map > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(4)").empty()
}

function place_query_service_on_success(b) {
    var g = ibHTML(Appery.storage.marker.get("$['name']"), Appery.storage.marker.get("$['google_id']"));
    var c = "";
    if (Appery.storage.from_g_bubble.get() === false) {
        c = c + g
    }
    var d = Appery.storage.place_tags.get();
    var j = [];
    if (d.length === 0) {
        c = c + '<div class="bubble_tag">No tags yet.</div>';
        c = c + '<a href="#" id="tag_edit" class="tag_edit" onclick="tag_edit_on_click()">Add tags</a>'
    } else {
        if (Appery.storage.from_tag_marker.get() === true) {
            Appery.storage.from_tag_marker.set(false);
            $.each(d, function(k, l) {
                j.push('<div class="bubble_tag">' + l.name.replace(Appery.storage.tag_search_value.get(), "<strong>$&</strong>") + "</div>")
            })
        } else {
            $.each(d, function(k, l) {
                j.push('<div class="bubble_tag">' + l.name + "</div>")
            })
        }
        c = c + j.join("") + '<div class="tag_edit_wrapper"><a href="#" id="tag_edit" class="tag_edit" onclick="tag_edit_on_click()">Manage tags</a></div>'
    }
    if (Appery.storage.from_g_bubble.get() === true) {
        var h = $(".tp-tags").height();
        $(".tp-tags").empty().append(c).resize();
        h = $(".tp-tags").height() - h;
        var e = $(".tp-tags").parent().parent().parent().parent();
        var a = $(".tp-tags").parent().parent().parent();
        var f = $(".tp-tags").parent().parent();
        $(f).css("height", h + parseInt($(f).css("height"))).resize();
        $(a).css("height", h + parseInt($(a).css("height"))).resize();
        $(e).css("height", h + parseInt($(e).css("height"))).resize();
        $(e).children("div").eq(0).children("div").eq(1).css("height", h + parseInt($(e).children("div").eq(0).children("div").eq(1).css("height"))).resize();
        $(e).children("div").eq(0).children("div").siblings().eq(3).css("height", h + parseInt($(e).children("div").eq(0).children("div").siblings().eq(3).css("height"))).resize();
        $(e).children("div").eq(0).children("div").siblings().eq(0).css("top", h + parseInt($(e).children("div").eq(0).children("div").siblings().eq(0).css("top"))).resize();
        $(e).children("div").eq(0).children("div").siblings().eq(2).css("top", h + parseInt($(e).children("div").eq(0).children("div").siblings().eq(2).css("top"))).resize();
        $(e).css("top", parseInt($(e).css("top")) - h).resize()
    } else {
        bubble.setContent(c);
        bubble.setContent(bubble.getContent());
        bubble.open(map, marker)
    }
}

function ibHTML(b, a) {
    return '<div id="ibhtml" class="ib-html"><div id="ibtitle" class="ib-title" place_id="' + a + '">' + b + "</div></div>"
}

function results_item_on_click(b) {
    var a = b.attributes.pid.value;
    Appery.storage.from_tag_marker.set(false);
    map.setCenter(new google.maps.LatLng(parseFloat(b.attributes.k.value), parseFloat(b.attributes.b.value)));
    tag_settings.places_where = '{"place_id":"' + a + '"}';
    _.find(markers, function(c) {
        return $(c.html).find("#ibtitle").attr("place_id") === a
    });
    google.maps.event.trigger(_.find(markers, function(c) {
        return $(c.html).find("#ibtitle").attr("place_id") === a
    }), "click");
    map.setZoom(16);
    Appery("resultsPanel").panel("close")
}

function results_item_create(c) {
    var b = ['<li id="UI_results_item" name="results_item" dsid="results_item" tabindex="2" data-icon="carat-r" class="UI_results_item  ui-btn ui-btn-icon-right ui-icon-carat-r ui-li-static ui-body-inherit ui-first-child ui-last-child ui-btn-up-b" k="', '" b="', '" pid="', '" ><div class="ui-li-static-container ui-btn"><div class="UI_resultsGrid_wrapper" data-wrapper-for="resultsGrid"><table id="UI_resultsGrid" class="UI_resultsGrid" dsid="resultsGrid" name="resultsGrid" cellpadding="0" cellspacing="0"><colgroup><col style="width:auto;"></colgroup><tbody><tr class="UI_resultsGrid_row_0"><td id="UI_resultsNameGridCell" name="resultsNameGridCell" class="UI_resultsNameGridCell" colspan="1" rowspan="1"><div class="cell-wrapper"><!-- name --><div name="name" id="UI_name" dsid="name" data-role="appery_label" class="UI_name">', '</div></div></td></tr><tr class="UI_resultsGrid_row_1"><td id="UI_resultsAddressGridCell" name="resultsAddressGridCell" class="UI_resultsAddressGridCell" colspan="1" rowspan="1"><div class="cell-wrapper"><div name="address" id="UI_address" dsid="address" data-role="appery_label" class="UI_address">', "</div></div></td></tr></tbody></table>"];
    var a = [];
    if (Appery.storage.from_tag_marker.get()) {
        a.push(b[0]);
        a.push(c[0].location[1]);
        a.push(b[1]);
        a.push(c[0].location[0]);
        a.push(b[2]);
        a.push(c[0].place_id);
        a.push(b[3]);
        a.push(c[0].place_name);
        for (i = 0; c[i]; i++) {
            a.push(b[4]);
            a.push(c[i].name.replace(Appery.storage.tag_search_value.get(), '<span style="color:#ffffff">$&</span>'))
        }
        a.push(b[5]);
        return a.join("")
    } else {
        a.push(b[0]);
        a.push(c.geometry.location.k);
        a.push(b[1]);
        a.push(c.geometry.location.B);
        a.push(b[2]);
        a.push(c.place_id);
        a.push(b[3]);
        a.push(c.name);
        a.push(b[4]);
        a.push(c.formatted_address);
        a.push(b[5]);
        return a.join("")
    }
}

function results_control_on_tap(a) {
    Apperyio("resultsPanel").panel("open")
}

function ui_on_load(a) {
    Appery("mobilecontainer").hide();
    initialize();
    Appery("mobilecontainer").show()
};