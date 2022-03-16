(function ( $ ) {
    var geocoder;
    var map;
    var markers = new Array();
    $.advaddresspicker = function() { }
    $.fn.advaddresspicker = function( options ) {

        // default settings:
        var defaults = {
            triggerElement: "", //
            openDelay: null, //openDelay - time in milliseconds
            openScrolled: null, //openScrolled - pixels forom top
            openAfterNClicks: null,
            width: null,
            verticalCentering: false,
            topOffset: null,
            bottomOffset: null,
            keyboard: true, // 	Closes the modal when escape key is pressed
            innerScroll: false,
            remote: null, // load content with ajax
            theme: '',
            location: {
                lat: null,
                long: null,
                address: '',
                city: '',
                municipality: '',
                prefecture: '',
                country: ''
            },
            keys:{
                GOOGLE_API_KEY: config.GOOGLE_API_KEY
            },
            dynAddress: true,
            responsive:{},
            onInitialize: function (e) {}, //event/callback
            onBeforeClose: function (e) {}, //event/callback
            onAfterClose: function (e) {}, //event/callback
            onBeforeOpen: function (e) {}, //event/callback
            onAfterOpen: function (e) {}, //event/callback
        };
        var settings = $.extend({}, defaults, options);

        var el = this;

        el.initialize = function () {
            var htmlmodal = `
                <div class="advaddresspicker-content">
                    <div class="advaddresspicker-col6">
                        <div class="advaddresspicker-map-wrapper">
                            <div id="advaddresspicker-toolbar">
                                <label for="advaddresspicker-marsearch">Search:</label>
                                <input 
                                    type="text" 
                                    id="advaddresspicker-searchaddress"
                                    class="advaddresspicker-searchaddress"
                                    name="advaddresspicker-searchaddress">
                                <div class="advaddresspicker-searchaddress-btn" onclick="$.advaddresspicker.codeAddress()"><img src="advaddresspicker/assets/img/search.png" /></div>
                                <div id="advaddresspicker-popup-addresses"><ul></ul></div>
                            </div>
                            <div id="advaddresspicker-map"></div>
                        </div>
                    </div>
                    <div class="advaddresspicker-col6">
                        <div class="advaddresspicker-addr">
                            <label for="advaddresspicker-addr">Address:</label>
                            <input 
                                type="text" 
                                id="advaddresspicker-address"
                                class="advaddresspicker-address"
                                name="advaddresspicker-address">
                        </div>
                    </div>
                </div>
            `;
            el.addClass('advaddresspicker-modal');
            el.wrapInner(htmlmodal);
            el.prepend($('<div class="advaddresspicker-modal-close">&times;</div>'));

            $.getScript("https://maps.googleapis.com/maps/api/js?key="+defaults.keys.GOOGLE_API_KEY+"&libraries=places&solution_channel=GMP_QB_addressselection_v1_cABC", function( data, textStatus, jqxhr ) {
                initmap();
            });

            
        };
        el.closeModal = function () {
            settings.onBeforeClose.call(el,el);
            el.parent('.bg-advaddresspicker-modal').addClass('closing');
            setTimeout(function(){
                if (el.parent().hasClass('bg-advaddresspicker-modal')) {
                    el.unwrap('.bg-advaddresspicker-modal');
                    el.parent('.bg-advaddresspicker-modal').removeClass('closing');
                }
            }, 400);
            $(el).css('padding-top','');
            settings.onAfterClose.call(el,el);
        };
        el.openModal = function () {
            if (el.parent().hasClass('bg-advaddresspicker-modal') === false) {
                settings.onBeforeOpen.call(el,el);
                el.wrap('<div class="bg-advaddresspicker-modal"></div>');
                
                if ( $(el).children('.advaddresspicker-content').children('.advaddresspicker-header').length > 0 ) {
                    var headerHeight = $(el).children('.advaddresspicker-content').children('.advaddresspicker-header').outerHeight();
                    console.log(headerHeight);
                    $(el).css({
                        'padding-top': parseFloat(headerHeight) + parseFloat($(el).css('padding-top'))
                    });
                }
                
                settings.onAfterOpen.call(el,el);
            }
        };

        return this.each(function () {

            var elem = $(this);
            var this_e = this;

            settings.onInitialize.call(this_e,el);

            el.initialize();

            checkResponsive();
            setSettings(this_e, true);

            $(window).on("resize", function (e) {
                checkResponsive();
                setSettings(this_e, false);
            });

            $(this_e).on("click", ".advaddresspicker-modal-close", function() {
                el.closeModal();
            });
            $(document).on('click', ".bg-advaddresspicker-modal", function() {
                if ($(this_e).parent().hasClass('bg-advaddresspicker-modal')) {
                    el.closeModal();
                }
            });
            $(this_e).click(function(e) {
                e.stopPropagation();
            });
        });

        function initmap(){
            geocoder = new google.maps.Geocoder();

            const componentForm = [
                'location',
                'locality',
                'administrative_area_level_1',
                'country',
                'postal_code',
            ];
            // The map, centered at Uluru
            map = new google.maps.Map(document.getElementById("advaddresspicker-map"), {
                zoom: 11,
                center: { lat: 37.4221, lng: -122.0841 },
                mapTypeControl: false,
                fullscreenControl: true,
                zoomControl: true,
                streetViewControl: true
            });
            const marker = new google.maps.Marker({map: map, draggable: false});
            /*
            const autocompleteInput = document.getElementById('location');
            const autocomplete = new google.maps.places.Autocomplete(autocompleteInput, {
                fields: ["address_components", "geometry", "name"],
                types: ["address"],
            });
            */
        }

        function checkResponsive() {
            var responsive_obj = settings.responsive;
            if (Object.keys(responsive_obj).length !== 0) {

                var windowW = $(window).width();
                var breakpoint = null;
                $.each(responsive_obj, function (key, value) {
                    if (windowW > key) {
                        breakpoint = key;
                    }
                });

                if (breakpoint !== null) {
                    settings = $.extend({}, settings, options);
                    settings = $.extend({}, settings, options.responsive[breakpoint]);
                } else {
                    settings = $.extend({}, settings, options);
                }
            }
        }

        function setSettings(this_e, refresh) {
            $(window).on("load resize", function (e) {
                if (settings.verticalCentering) {
                    if ($(this_e).height() < viewport().height) {
                        $(this_e).addClass('verticalCentering');
                    } else {
                        $(this_e).removeClass('verticalCentering');
                    }
                }
            });
            if (settings.remote !== null) {
                $(this_e).children('.wg-content').load(settings.remote);
            }
            if (settings.width !== null) {
                $(this_e).css('width', settings.width);
            }
            if (settings.topOffset !== null) {
                $(this_e).css('margin-top', settings.topOffset);
            }
            if (settings.bottomOffset !== null) {
                $(this_e).css('margin-bottom', settings.bottomOffset);
            }
            if (settings.innerScroll === true) {
                $(this_e).addClass('innerScroll');
                var sum_offset = null;
                var mt = parseFloat($(this_e).css('margin-top'));
                var mb = parseFloat($(this_e).css('margin-bottom'));
                var pt = parseFloat($(this_e).css('padding-top'));
                var pb = parseFloat($(this_e).css('padding-bottom'));
                var bt = parseFloat($(this_e).css('border-top-width'));
                var bb = parseFloat($(this_e).css('border-bottom-width'));
                sum_offset = mt + mb + pt + pb + bt + bb;
                var sum_offset_val = 'calc(100vh - ' + sum_offset + 'px)';
                $(this_e).children('.wg-content').css('max-height', sum_offset_val);
            }
            if (settings.theme !== '') {
                $(this_e).addClass(settings.theme);
            }

            if (settings.openAfterNClicks !== null) {
                var x = 12 * 12; //or whatever offset
                var CurrentDate = new Date();
                CurrentDate.setMonth(CurrentDate.getMonth() + x);
                var n_sel = el.selector;
                var n_sel = n_sel.replace("#", "id_");
                n_sel = n_sel.replace(".", "class_");
                n_sel = n_sel.replace("-", "_");

                var cookie_name = "wgModalCounter" + n_sel;
                var cookie_val = readCookie(cookie_name);
                if (cookie_val <= settings.openAfterNClicks){
                    cookie_val++;
                    document.cookie = cookie_name + "=" + cookie_val + "; expires=" + CurrentDate + ";path=/";
                    if (cookie_val === settings.openAfterNClicks){
                        el.openModal();
                    }
                }

            }
            if (settings.openScrolled !== null) {
                var x = 12 * 12; //or whatever offset
                var CurrentDate = new Date();
                CurrentDate.setMonth(CurrentDate.getMonth() + x);
                var n_sel = el.selector;
                var n_sel = n_sel.replace("#", "id_");
                n_sel = n_sel.replace(".", "class_");
                n_sel = n_sel.replace("-", "_");

                var cookie_name = "wgAlreadyOpened" + n_sel;
                
                $(window).on("load resize scroll", function (e) {
                    
                    var cookie_ao_val = readCookie(cookie_name);
                    var scroll = $(this).scrollTop();
                    if (scroll >= settings.openScrolled && cookie_ao_val != 1) {
                        el.openModal();
                        document.cookie = cookie_name + "=1; expires=" + CurrentDate + ";path=/";
                    }
                });
            }
            if (refresh) {
                if (settings.openDelay !== null) {
                    setTimeout(function(){
                        el.openModal();
                    }, settings.openDelay);

                }
            }
            if (settings.triggerElement !== '') {
                $(settings.triggerElement).click(function (){
                    el.openModal();
                });
            }
            if (settings.keyboard === true) {

                $(document).keyup(function (e) {
                    if (e.keyCode === 27 && $(this_e).parent().hasClass('bg-wg-modal')) { // escape key maps to keycode `27`
                        el.closeModal();
                    }
                });
            }
        }
    };


    $.advaddresspicker.codeAddress = function() {
        var address = document.getElementById('advaddresspicker-searchaddress').value;
        var addresses_list = document.getElementById('advaddresspicker-popup-addresses');

        var Addresses_results = [];

        const request = {
            query: address,
            fields: ["name", "formatted_address", "geometry"],
        };
        service = new google.maps.places.PlacesService(map);
        
        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                for (let i = 0; i < results.length; i++) {
                    //createMarker(results[i].geometry.location);
                    addAddress2list(results[i]);
                }

                
        
              map.setCenter(results[0].geometry.location);
            }
        });

        $('.fLocation').click(showNfocusMarker(Addresses_results[i]));

        function addAddress2list(location) {
            console.log(location);
            var ul = addresses_list.querySelector('ul');
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(location.formatted_address));
            li.className = 'fLocation';
            ul.appendChild(li);
            Addresses_results.push(location);
        }

        function showNfocusMarker(location){
            console.log("mouseenter: ",location);
            //delAllMarkers();
            //createMarker(location);
            //focusMarker(location);
        }

        function delAllMarkers(){
            markers = [];
        }

        function createMarker(location) {
            marker = new google.maps.Marker({
                position: location,
                map: map
            });
            markers.push(marker);
        }

        function focusMarker(location){
            map.setCenter(location.getPosition());
        }
    }

}( jQuery ));