// @ts-ignore
import {setupContentUpdateListeners, setupStateChangeListeners} from "./listeners";
import {googleDistanceMatrix} from "./endpoints";
import {TravelTimeRequest} from "../../../../common/src/main/ts/google/distance_matrix";

/** Page state machine
 *
 *      |-> free
 *      |  browse
 *      |     |
 *      |     ▼
 *      |__ destination <-|
 *      |   select        |
 *      |     |           |
 *      |     ▼           |
 *      |__ criteria      |
 *      |   refine        |
 *      |     |           |
 *      |     ▼           |
 *      |__ refined ______|
 *          browse
 **/

// setup web app dynamic content
setupStateChangeListeners();
setupContentUpdateListeners();

// user navigates to atlas -> tick
// google map with a default of sydney -> tick
// populate with map markers from flatmates.com.au results based on map geo bounds -> tick
// users can click flatmates price markers to see a flyout card and link -> TODO

// changes to zoom level issue a request to plot more markers flatmates map markers -> tick

// user starts typing a destination -> tick
// autocomplete provides a list of options -> tick
// user selects one of the options -> tick
// search bar collapses and turns into a "filters" menu -> tick
// centre google map on lat lng of suggestion. zoom level = 15 -> tick
// user can now click on results to see travel time -> TODO

// user clicks filters menu -> tick
// user enters search criteria -> tick
// user hits search now button -> tick
// we update the standing filters state of the users flatmates requests -> tick
// user clicks on result -> tick
// user gets a flyout of the result with details, including travel time -> TODO

// user can adjust travel settings -> TODO
// mode of transport -> TODO


// a better, safer throttle -> tick

// need to remove duplicate map markers before plotting more -> tick
