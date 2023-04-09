var initLoad = true;
var layerTypes = {
    'fill': ['fill-opacity'],
    'line': ['line-opacity'],
    'circle': ['circle-opacity', 'circle-stroke-opacity'],
    'symbol': ['icon-opacity', 'text-opacity'],
    'raster': ['raster-opacity'],
    'fill-extrusion': ['fill-extrusion-opacity'],
    'heatmap': ['heatmap-opacity']
}

var alignments = {
    'left': 'lefty',
    'center': 'centered',
    'right': 'righty',
    'full': 'fully'
}

function getLayerPaintType(layer) {
    var layerType = map.getLayer(layer).type;
    return layerTypes[layerType];
}

function setLayerOpacity(layer) {
    var paintProps = getLayerPaintType(layer.layer);
    paintProps.forEach(function(prop) {
        var options = {};
        if (layer.duration) {
            var transitionProp = prop + "-transition";
            options = { "duration": layer.duration };
            map.setPaintProperty(layer.layer, transitionProp, options);
        }
        map.setPaintProperty(layer.layer, prop, layer.opacity, options);
    });
}

var story = document.getElementById('story');
var features = document.createElement('div');
features.setAttribute('id', 'features');

var header = document.createElement('div');

if (config.title) {
    var titleText = document.createElement('h1');
    titleText.innerText = config.title;
    header.appendChild(titleText);
}

if (config.subtitle) {
    var subtitleText = document.createElement('h2');
    subtitleText.innerText = config.subtitle;
    header.appendChild(subtitleText);
}

if (config.byline) {
    var bylineText = document.createElement('p');
    bylineText.innerText = config.byline;
    header.appendChild(bylineText);
}

if (header.innerText.length > 0) {
    header.classList.add(config.theme);
    header.setAttribute('id', 'header');
    story.appendChild(header);
}


// -------------------------------------------------
// create chapters
config.chapters.forEach((record, idx) => {
    var container = document.createElement('div');
    var chapter = document.createElement('div');

    // if (record.title) {
    //     var title = document.createElement('h3');
    //     title.innerText = record.title;
    //     chapter.appendChild(title);
    // }

    // if (record.image) {
    //     var image = new Image();
    //     image.src = record.image;
    //     chapter.appendChild(image);
    // }

    // if (record.description) {
    //     var story = document.createElement('p');
    //     story.innerHTML = record.description;
    //     chapter.appendChild(story);
    // }

    container.setAttribute('id', record.id);
    container.classList.add('step');
    if (idx === 0) {
        container.classList.add('active');
    }

    chapter.classList.add(config.theme);
    container.appendChild(chapter);
    container.classList.add(alignments[record.alignment] || 'centered');
    if (record.hidden) {
        container.classList.add('hidden');
    }
    features.appendChild(container);
});

story.appendChild(features);


// -------------------------------------------
// create footer
var footer = document.createElement('div');

if (config.footer) {
    var footerText = document.createElement('p');
    footerText.innerHTML = config.footer;
    footer.appendChild(footerText);
}

if (footer.innerText.length > 0) {
    footer.classList.add(config.theme);
    footer.setAttribute('id', 'footer');
    story.appendChild(footer);
}

// -------------------------------------------
// set mapbox API key
mapboxgl.accessToken = config.accessToken;


// -------------------------------------------
// create map
const transformRequest = (url) => {
    const hasQuery = url.indexOf("?") !== -1;
    const suffix = hasQuery ? "&pluginName=scrollytellingV2" : "?pluginName=scrollytellingV2";
    return {
        url: url + suffix
    }
}

var map = new mapboxgl.Map({
    container: 'map',
    style: config.style,
    center: config.chapters[0].location.center,
    zoom: config.chapters[0].location.zoom,
    bearing: config.chapters[0].location.bearing,
    pitch: config.chapters[0].location.pitch,
    interactive: false,
    // interactive: true,
    transformRequest: transformRequest,
    projection: config.projection
});

// -------------------------------------------
// Create a inset map if enabled in config.js
if (config.inset) {
    var insetMap = new mapboxgl.Map({
        container: 'mapInset', // container id
        style: 'mapbox://styles/mapbox/dark-v10', //hosted style id
        center: config.chapters[0].location.center,
        // Hardcode above center value if you want insetMap to be static.
        zoom: 4, // starting zoom
        hash: false,
        interactive: false,
        attributionControl: false,
        //Future: Once official mapbox-gl-js has globe view enabled,
        //insetmap can be a globe with the following parameter.
        //projection: 'globe'
    });
}

// -------------------------------------------
// Create a marker at chapters' center location if enabled in config.js
if (config.showMarkers) {
    var marker = new mapboxgl.Marker({ color: config.markerColor });
    marker.setLngLat(config.chapters[0].location.center).addTo(map);
}

// instantiate the scrollama
var scroller = scrollama();


// =========================================================================
// load map
map.on("load", function() {

    // set language --------------------------------------------------------
    let labels = ['country-label', 'state-label',
        'settlement-label', 'settlement-subdivision-label',
        'airport-label', 'poi-label', 'water-point-label',
        'water-line-label', 'natural-point-label',
        'natural-line-label', 'waterway-label', 'road-label'
    ];

    labels.forEach(label => {
        map.setLayoutProperty(label, 'text-field', ['get', 'name_en']); // name_zh-Hant
    });


    // set 3d terrain ------------------------------------------------------
    if (config.use3dTerrain) {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
        // add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        // add a sky layer that will show when the map is highly pitched
        map.addLayer({
            'id': 'sky',
            'type': 'sky',
            'paint': {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 0.0],
                'sky-atmosphere-sun-intensity': 15
            }
        });
    };



    // As the map moves, grab and update bounds in inset map. ---------------
    if (config.inset) {
        map.on('move', getInsetBounds);
    }
    // setup the instance, pass callback functions
    scroller
        .setup({
            step: '.step',
            offset: 0.5,
            progress: true
        })
        .onStepEnter(async response => {
            var chapter = config.chapters.find(chap => chap.id === response.element.id);
            response.element.classList.add('active');


            // toggle hero card
            const elem_hero = document.getElementById('hero');
            if (chapter.id === "first-identifier") {
                elem_hero.classList.remove('hide');
            } else elem_hero.classList.add('hide');

            // toggle info card
            const elem_info = document.getElementById('info');
            if (chapter.id === "first-identifier") {
                elem_info.classList.add('hide');
            } else elem_info.classList.remove('hide');

            // toggle mapInset
            const elem_inset = document.getElementById('mapInset');
            if (chapter.id === "first-identifier") {
                elem_inset.classList.add('hidden');
            } else elem_inset.classList.remove('hidden');

            // toggle media type
            const elem_mediaImg = document.getElementById('Imgcontent')
            const elem_mediaVideo = document.getElementById('Videocontent')
            if (chapter.mediaType === 'video') {
                elem_mediaImg.classList.add('u-hidden');
                elem_mediaVideo.classList.remove('u-hidden');
            } else {
                elem_mediaImg.classList.remove('u-hidden');
                elem_mediaVideo.classList.add('u-hidden');
            }
            // clear media src if chapter scroll
            elem_mediaImg.src = "https://github.com/GIAAIL/Resilient-Homeland-Data-Map_v1/blob/main/images/info_loading.PNG";
            elem_mediaVideo.src = "https://github.com/GIAAIL/Resilient-Homeland-Data-Map_v1/blob/main/images/info_loading.PNG";


            // update the project title h2
            document.getElementById("projectTitle").innerHTML = chapter.title;


            map[chapter.mapAnimation || 'flyTo'](chapter.location);
            // Incase you do not want to have a dynamic inset map,
            // rather want to keep it a static view but still change the
            // bbox as main map move: comment out the below if section.
            if (config.inset) {
                if (chapter.location.zoom < 5) {
                    insetMap.flyTo({ center: chapter.location.center, zoom: 0 });
                } else {
                    insetMap.flyTo({ center: chapter.location.center, zoom: 4 });
                }
            }
            if (config.showMarkers) {
                marker.setLngLat(chapter.location.center);
            }
            if (chapter.onChapterEnter.length > 0) {
                chapter.onChapterEnter.forEach(setLayerOpacity);
            }
            if (chapter.callback) {
                window[chapter.callback]();
            }
            if (chapter.rotateAnimation) {
                map.once('moveend', () => {
                    const rotateNumber = map.getBearing();

                    map.rotateTo(rotateNumber + 180, {
                        duration: 100000,
                        easing: function(t) {
                            return t;
                        }
                    });

                    // requestAnimationFrame -----------------------------------
                    // requestAnimationFrame(rotateCamera);
                    // const timestamp_curr = Math.floor(window.performance.now());

                    // function rotateCamera(timestamp) {
                    //     // clamp the rotation between 0 -360 degrees
                    //     // Divide timestamp by 100 to slow rotation to ~10 degrees / sec

                    //     map.rotateTo(rotateNumber + ((timestamp - timestamp_curr) / 300) % 360, { duration: 0 }); // 300 -> rotate speed, larger than slower
                    //     // Request the next frame of the animation.
                    //     requestAnimationFrame(rotateCamera);

                    // }
                });
            }
        })
        .onStepExit(response => {
            var chapter = config.chapters.find(chap => chap.id === response.element.id);
            response.element.classList.remove('active');
            if (chapter.onChapterExit.length > 0) {
                chapter.onChapterExit.forEach(setLayerOpacity);
            }
        });




    //  Center the map on a clicked feature ------------------------------------------
    //  add nycu photo location 
    map.addSource('points', {
        type: 'geojson',
        // data: '../geojson/photo_loaction.txt'
        // data: 'https://scidm.nchc.org.tw/dataset/c4b05e4e-d520-490c-9ef5-ca88b83dee6d/resource/2a0702ce-3874-4d7e-94bf-13d9376ed9f7/nchcproxy/2023_0315_153948_photo_location.txt'   //x4096
        data: 'https://scidm.nchc.org.tw/dataset/c4b05e4e-d520-490c-9ef5-ca88b83dee6d/resource/65039ad6-ab60-4055-a3ff-77d575f98e8f/nchcproxy/2023_0321_183347_photo_location.txt' // x640
    });

    map.addLayer({
        'id': 'circle',
        'type': 'circle',
        'source': 'points',
        'paint': {
            'circle-color': '#1e9696',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.8
        }
    });

    //  Center the map on a clicked feature
    map.on('click', 'circle', (e) => {
        map.flyTo({
            center: e.features[0].geometry.coordinates,
            essential: true,
            padding: {
                top: 0,
                bottom: 0,
                left: 300,
                right: 0
            },
            duration: 1200
        });


        changeImageSource(e.features[0].properties.imgurl);
    });


    // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
    map.on('mouseenter', 'circle', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'circle', () => {
        map.getCanvas().style.cursor = '';
    });







    // Add Video Symbol Layer -------------------------------------------------------
    map.loadImage(
        'https://github.com/GIAAIL/Resilient-Homeland-Data-Map_v1/blob/main/images/pin_VideoCamera.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
            // Add a GeoJSON source with 2 points
            map.addSource('video_points', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                            // feature for Mapbox DC
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [121.84615, 24.49336]
                            },
                            'properties': {
                                'title': 'Site A - live streaming',
                                'videourl': 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&modestbranding=1&loop=1&playlist=jfKfPfyJRdk'
                            }
                        },
                        {
                            // feature for Mapbox SF
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [121.84715, 24.49]
                            },
                            'properties': {
                                'title': 'Site B - auto repeat',
                                'videourl': 'https://www.youtube.com/embed/84Vi1Mbhzsw?autoplay=1&mute=1&modestbranding=1&playlist=84Vi1Mbhzsw&loop=1'
                            }
                        }
                    ]
                }
            });

            // Add a symbol layer
            map.addLayer({
                'id': 'video_points',
                'type': 'symbol',
                'source': 'video_points',
                'layout': {
                    'icon-image': 'custom-marker',
                    'icon-size': 0.35,
                    // get the title name from the source's "title" property
                    'text-field': ['get', 'title'],
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 2.25],
                    'text-anchor': 'top',
                    'text-size': 12
                },
                'paint': {
                    'text-color': '#ffffff'
                }
            });
        }

    );

    //  Center the map video_points a clicked feature
    map.on('click', 'video_points', (e) => {
        map.flyTo({
            center: e.features[0].geometry.coordinates,
            essential: true,
            padding: {
                top: 0,
                bottom: 0,
                left: 300,
                right: 0
            },
            duration: 1200
        });


        changeVideoSource(e.features[0].properties.videourl);
    });

    map.on('mouseenter', 'video_points', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'video_points', () => {
        map.getCanvas().style.cursor = '';
    });








    //  Add Drone Path Layer ---------------------------------------------------------
    // 2023_0321_201932_drone_path_2.txt
    var ur_lineGeometry = "https://scidm.nchc.org.tw/dataset/c4b05e4e-d520-490c-9ef5-ca88b83dee6d/resource/b595752b-a55c-4a9a-b9e6-074515c7905d/nchcproxy/2023_0321_201932_drone_path_2.txt"

    var ur_lineGeometry_0 = "https://scidm.nchc.org.tw/dataset/c4b05e4e-d520-490c-9ef5-ca88b83dee6d/resource/71873f7c-5526-4843-b803-39d4f177d814/nchcproxy/2023_0409_170757_drone_path_0.txt"
    var ur_lineGeometry_1 = "https://scidm.nchc.org.tw/dataset/c4b05e4e-d520-490c-9ef5-ca88b83dee6d/resource/696d3af3-0d08-457d-8508-35d966ed6559/nchcproxy/2023_0409_170757_drone_path_1.txt"
    var ur_lineGeometry_2 = "https://scidm.nchc.org.tw/dataset/c4b05e4e-d520-490c-9ef5-ca88b83dee6d/resource/533dd5ea-730d-42b9-b101-108df58bb912/nchcproxy/2023_0409_170757_drone_path_2.txt"

    // Three.js line geometry test ---------------------------------------------------
    map.addLayer({
        id: 'custom_layer',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function(map, mbxContext) {
            window.tb = new Threebox(
                map,
                mbxContext, {
                    defaultLights: true,
                    enableSelectingFeatures: true,
                    enableSelectingObjects: true,
                    enableDraggingObjects: true,
                    enableRotatingObjects: true,
                    enableTooltips: true
                }
            );

        },
        render: function(gl, matrix) {
            tb.update();
        }
    });

    createThreejsLine(ur_lineGeometry_0, tb);
    createThreejsLine(ur_lineGeometry_1, tb);
    createThreejsLine(ur_lineGeometry_2, tb);


    // fetch drone path from url
    // fetchFunction(ur_lineGeometry_0, function(data) {
    //     var lineInstance = tb.line({
    //         geometry: data.features[0].geometry.coordinates,
    //         width: 2,
    //         color: '#1e9696'
    //     });
    //     tb.add(lineInstance);
    // });



    // map.addSource('route', {
    //     'type': 'geojson',
    //     // 'data': '../geojson/2023_0321_201932_drone_path_2.txt'
    //     'data': ur_lineGeometry
    // });

    // map.addLayer({
    //     'id': 'route',
    //     'type': 'line',
    //     'source': 'route',
    //     'layout': {
    //         'line-join': 'round',
    //         'line-cap': 'round'
    //     },
    //     'paint': {
    //         'line-color': '#888',
    //         'line-width': 2
    //     }
    // });

    // const popup = new mapboxgl.Popup({ closeButton: false, offset: 25 });

    // // 建立無人機圖標
    // const el = document.createElement('div');
    // el.className = 'marker';
    // // make a marker for each feature and add it to the map
    // const marker = new mapboxgl.Marker(el)
    //     .setLngLat([121.3218, 23.5911, 680.0])
    //     .setPopup(popup)
    //     .addTo(map)
    //     .togglePopup();

    // const lngLat = {
    //     lng: 121.3218,
    //     lat: 23.5911
    // };

    // Update the popup altitude value and marker location
    // popup.setHTML('Altitude: ' + 12.0 + 'm<br/>');
    // marker.setLngLat(lngLat);

});




// =========================================================
// other function methods

// ---------------------------------------
// Helper functions for insetmap
function getInsetBounds() {
    let bounds = map.getBounds();

    let boundsJson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            bounds._sw.lng,
                            bounds._sw.lat
                        ],
                        [
                            bounds._ne.lng,
                            bounds._sw.lat
                        ],
                        [
                            bounds._ne.lng,
                            bounds._ne.lat
                        ],
                        [
                            bounds._sw.lng,
                            bounds._ne.lat
                        ],
                        [
                            bounds._sw.lng,
                            bounds._sw.lat
                        ]
                    ]
                ]
            }
        }]
    }

    if (initLoad) {
        addInsetLayer(boundsJson);
        initLoad = false;
    } else {
        updateInsetLayer(boundsJson);
    }

}


// -----------------------------------------
// add indet map layer
function addInsetLayer(bounds) {
    insetMap.addSource('boundsSource', {
        'type': 'geojson',
        'data': bounds
    });

    insetMap.addLayer({
        'id': 'boundsLayer',
        'type': 'fill',
        'source': 'boundsSource', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#fff', // blue color fill
            'fill-opacity': 0.2
        }
    });
    // // Add a black outline around the polygon.
    insetMap.addLayer({
        'id': 'outlineLayer',
        'type': 'line',
        'source': 'boundsSource',
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 1
        }
    });
}

// update indet map layer
function updateInsetLayer(bounds) {
    insetMap.getSource('boundsSource').setData(bounds);
}


// -----------------------------------------
// setup resize event
window.addEventListener('resize', scroller.resize);


// -----------------------------------------
// change info img
function changeImageSource(imgsrc) {
    document.getElementById("Imgcontent").src = imgsrc;
}

// change info video
function changeVideoSource(videosrc) {
    document.getElementById("Videocontent").src = videosrc;
}


// -----------------------------------------
//convenience function for fetch
function fetchFunction(url, cb) {
    fetch(url)
        .then(
            function(response) {
                if (response.status === 200) {
                    response.json()
                        .then(function(data) {
                            cb(data)
                        })
                }
            }
        )
}


// -----------------------------------------
// create line geometry from fetch function
function createThreejsLine(ur_lineGeometry, tb) {
    fetchFunction(ur_lineGeometry, function(data) {
        // console.log(data.features[0].geometry.coordinates);
        var lineInstance = tb.line({
            geometry: data.features[0].geometry.coordinates,
            width: 2,
            color: '#1e9696'
        });
        // console.log(data.features[0].geometry.coordinates)
        // var tubeInstance = tb.tube({
        //     geometry: data.features[0].geometry.coordinates,
        //     radius: 20,
        //     color: '#1e9696'
        // })

        tb.add(lineInstance);
        // tb.add(tubeInstance);

    })
}


// -----------------------------------------
// rotate camera 



// -----------------------------------------
// toggle left/right sidebar
// function toggleSidebar(id) {
//     const elem = document.getElementById(id);
//     // Add or remove the 'collapsed' CSS class from the sidebar element.
//     // Returns boolean "true" or "false" whether 'collapsed' is in the class list.
//     const collapsed = elem.classList.toggle('collapsed');
//     const padding = {};
//     // 'id' is 'right' or 'left'. When run at start, this object looks like: '{left: 300}';
//     padding[id] = collapsed ? 0 : 300; // 0 if collapsed, 300 px if not. This matches the width of the sidebars in the .sidebar CSS class.
//     // Use `map.easeTo()` with a padding option to adjust the map's center accounting for the position of sidebars.
//     map.easeTo({
//         padding: padding,
//         duration: 1000 // In ms. This matches the CSS transition duration property.
//     });
// }


// -----------------------------------------
// change the url of image
// function changeImageSource(imgsrc) {
//     document.getElementById("Imgcontent").src = imgsrc;
// }


// -----------------------------------------
// map padding animation
// function mapPaddingTrue() {
//     map.easeTo({
//         padding: 300,
//         duration: 1000
//     });

//     console.log("true")
// }
