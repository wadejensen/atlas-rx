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

function initChart() {
    /** accesses global declared in index.html */
    var ctx = document.getElementById('chart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
        // The data for our dataset
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45]
            }]
        },
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}
