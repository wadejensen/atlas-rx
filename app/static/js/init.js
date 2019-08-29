/**
 * A very short js snippet to customize the initialization of js libraries
 * retrieved dynamically from CDNs, eg.
 *  * Google Maps JavaScript client,
 *  * Chart.js
 *
 * Primary web application code is still served as a js bundle transpiled from
 * Typescript.
 */

function initMap() {
    /** accesses global declared in index.html */
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -33.873176, lng: 151.208148},
        zoom: 16,
        gestureHandling: "cooperative",
        streetViewControl: false,
    });
}
