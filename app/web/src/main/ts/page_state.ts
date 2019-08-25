interface PageState {
  toFreeBrowse(): void
  toDestinationSelect(): void
  toCriteriaRefine(): void
  toRefinedBrowse(): void
}

/** Page state machine
 *
 *      |-> free
 *      |  browse
 *      |     |
 *      |     ▼
 *      |__ destination
 *      |   select
 *      |     |
 *      |     ▼
 *      |__ criteria <-
 *      |   refine    |
 *      |     |       |
 *      |     ▼       |
 *      |__ refined __|
 *          browse
**/

// initial state
// User may browse Google Map to see flatmates.com.au results
// No filtering of search results
// No travel time information in map marker flyout cards
export class FreeBrowse implements PageState {
  constructor() {}
  toFreeBrowse(): void {
    // noop
  }

  toDestinationSelect(): void {
    throw new Error("TODO")
  }

  toCriteriaRefine(): void {
    throw new Error("Unsupported operation")
  }

  toRefinedBrowse(): void {
    throw new Error("Unsupported operation")
  }
}

// User has clicked the search bar
export class DestinationSelect implements PageState {
  toFreeBrowse(): void {
    throw new Error("TODO")
  }

  toDestinationSelect(): void {
    // noop
  }

  toCriteriaRefine(): void {
    throw new Error("TODO")
  }

  toRefinedBrowse(): void {
    throw new Error("Unsupported operation")
  }
}

export class CriteriaRefine implements PageState {
  toFreeBrowse(): void {
    throw new Error("TODO")
  }

  toDestinationSelect(): void {
    throw new Error("Unsupported operation")
  }

  toCriteriaRefine(): void {
    // noop
  }

  toRefinedBrowse(): void {
    throw new Error("TODO")
  }
}

export class RefinedBrowse implements PageState {
  toFreeBrowse(): void {
    throw new Error("TODO")
  }

  toDestinationSelect(): void {
    throw new Error("Unsupported operation")
  }

  toCriteriaRefine(): void {
    throw new Error("Unsupported operation")
  }

  toRefinedBrowse(): void {
    //noop
  }
}

