var config = {
    style: 'mapbox://styles/mapbox/dark-v10', // dark style
    accessToken: 'pk.eyJ1IjoieXVuY2hlbi1sZWUiLCJhIjoiY2wxeGttYmg0MDNwaTNicWY5bWM5ZHM0OCJ9.gS5S-DMTk308nQP8MAzN0w', // my token
    // showMarkers: true,
    showMarkers: false,
    markerColor: '#1e9696', // marker color : gray
    //projection: 'equirectangular',
    //Read more about available projections here
    //https://docs.mapbox.com/mapbox-gl-js/example/projections/
    inset: true,
    theme: 'dark',
    // use3dTerrain: false, //set true for enabling 3D maps.
    use3dTerrain: true, //set true for enabling 3D maps.

    // header information
    title: 'Projects',
    subtitle: '... subtitle ...',
    byline: 'By ...',
    footer: '&copy; National Yang Ming Chiao Tung University. Created using <a href="https://github.com/mapbox/storytelling" target="_blank">Mapbox Storytelling</a> template.',
    chapters: [{
            id: 'first-identifier',
            alignment: 'left',
            hidden: false,
            title: '',
            // image: './path/to/image/source.png',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud  ',
            location: {
                center: [120.680, 24.450],
                zoom: 7.5,
                pitch: 0,
                bearing: 0
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                // {
                //     layer: 'layer-name',
                //     opacity: 1,
                //     duration: 5000
                // }
            ],
            onChapterExit: [
                // {
                //     layer: 'layer-name',
                //     opacity: 0
                // }
            ],
            mediaType: 'none'
        },
        {
            id: 'second-identifier',
            alignment: 'left',
            hidden: false,
            title: 'On the Sea',
            // image: './path/to/image/source.png',
            description: 'Copy these sections to add to your story.',
            location: {
                center: [119.90898, 23.34897],
                zoom: 10,
                pitch: 60,
                bearing: -30,
                // flyTo additional controls-
                // These options control the flight curve, making it move
                // slowly and zoom out almost completely before starting
                // to pan.
                //speed: 2, // make the flying slow
                //curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: [],
            mediaType: 'none'
        },
        {
            id: 'third-identifier',
            alignment: 'left',
            hidden: false,
            title: 'Photo in NYCU',
            // image: './path/to/image/source.png',
            description: 'Copy these sections to add to your story.',
            location: {
                center: [120.9978, 24.7867],
                zoom: 16,
                pitch: 26,
                bearing: 0
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [],
            onChapterExit: [],
            mediaType: 'image'
        },
        {
            id: 'fourth-chapter',
            alignment: 'left',
            hidden: false,
            title: 'Drone Flight Path',
            // image: './path/to/image/source.png',
            description: 'Copy these sections to add to your story.',
            location: {
                // center: [121.469, 23.701],
                center: [121.321873, 23.593414],
                zoom: 14.5,
                // pitch: 0,
                // pitch: 60,
                pitch: 40,
                bearing: -60.00
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: [],
            mediaType: 'none'
        }, {
            id: 'fifth-chapter',
            alignment: 'left',
            hidden: false,
            title: 'Video Streaming',
            // image: './path/to/image/source.png',
            description: 'Copy these sections to add to your story.',
            location: {
                center: [121.84615, 24.49336],
                zoom: 14,
                pitch: 52,
                bearing: 103
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [],
            onChapterExit: [],
            mediaType: 'video'
        }
    ]
};
