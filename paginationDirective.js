/**
 * simplePagination - AngularJS module for creating a simple paging
 *
 * To use:
 * <paginate nav-size=5 num-per-page=10 query="search">
 *  <!-- any additional html here -->
 *  <div ng-repeat='item in filteredItems'>
 *      {{item.val}} <!-- this item will be paginated -->
 *  </div>
 *  <!-- any additional html here -->
 * </paginate>
 *
 */

(function() {
    var module;
    // grab or create module
    try {
        module = angular.module('simplePagination');
    } catch(err) {
        module = angular.module('simplePagination', []);
    }

    module.directive('paginate', function ($filter) {
        return {
            templateUrl: 'paginate.html',
            transclude: true,
            scope: {
                pageCount: '@', // number of pages for the content
                numPerPage: '@', // number of records per page
                currentPage: '@', // page that is currently being displayed
                navSize: '@', // number of pages to be shown in the list
                query: '=', // search criteria
                items: '=', // full list of records to be sent to the directive
                pages: '=', // array for pages that will be shown in the list
                // a trimmed list of items, containing only the items that should fill the current page
                filteredItems: '=',
                // a full list of items that meet the query criteria
                searchedItems: '=',
                sortType: "@", // sort by column
                sortReverse: "@" // sort direction
            },
            link: function (scope, elem, attr, ctrl, transclude) {
                scope.items = scope.items || [];
                scope.pages = scope.pages || [];
                scope.filteredItems = scope.filteredItems || [];

                // watch for current page changes
                scope.$watch('currentPage', function () {
                    calcPages();
                });

                // watch for updates to the item collection
                scope.$watchCollection('items', function (newItems, oldItems) {
                    scope.items = newItems;
                    searchCollection();
                    calcPages();
                });

                // watch for updates to the query
                scope.$watch('query', function () {
                    searchCollection();
                });

                // determines the overal page count
                scope.pageCount = Math.ceil(scope.items.length / scope.numPerPage);
                var navSize = -1;
                scope.currentPage = 1;

                // moves the page to the next page
                scope.nextPage = function () {
                    if (scope.currentPage < scope.pageCount) {
                        scope.currentPage++;
                    }
                }

                // moves the page to the previous page
                scope.prevPage = function () {
                    if (scope.currentPage > 1) {
                        scope.currentPage--;
                    }
                }

                // sets a specific page
                scope.setPage = function (page) {
                    scope.currentPage = page;
                }

                // render the html inside the directive
                transclude(scope.$new(), function (clone) {
                    elem.append(clone);
                })


                calcPages();

                /**
                 * Calculate the pages that should be shown on the pagination list
                 * 
                 */
                function calcPages(isSearch) {
                    scope.pages = [];
                    var mid, max, min;
                    navSize = (scope.navSize > scope.pageCount ? scope.pageCount : scope.navSize);
                    mid = Math.ceil(navSize / 2);
                    if (scope.currentPage <= mid) {
                        min = 1;
                        max = navSize;
                    } else if (scope.currentPage > mid && (scope.currentPage + mid - 1) < scope.pageCount) {
                        min = scope.currentPage - mid + 1;
                        max = min + parseInt(navSize) - 1;
                    } else {
                        max = scope.pageCount;
                        min = scope.pageCount - navSize + 1;
                    }

                    for (var i = min; i <= max; i++) {
                        scope.pages.push(i);
                    }

                    var begin = (scope.currentPage - 1) * scope.numPerPage, end = begin + parseInt(scope.numPerPage);
                    // if searching, set the items to the searched, otherwise just display the items
                    if (isSearch) {
                        scope.filteredItems = scope.searchedItems.slice(begin, end);
                    } else {
                        scope.filteredItems = scope.items.slice(begin, end);
                    }

                    return;
                }

                // search the items collection to find matches
                function searchCollection() {
                    scope.searchedItems = $filter('filter')(scope.items, function (item) {
                        for (var attr in item) {
                            if (match(item[attr], scope.query)) {
                                return true;
                            }
                        }
                        return false;
                    });
                    scope.currentPage = 1;
                    scope.pageCount = Math.ceil(scope.searchedItems.length / scope.numPerPage);
                    calcPages(true);
                }

                // checks if search matches any substring in the item
                function match(item, search) {
                    if (search === undefined || search === '') {
                        return true;
                    }
                    if (typeof (item) === 'string' && item.length) {
                        return item.toLowerCase().indexOf(search.toLowerCase()) !== -1;
                    } else if (typeof (item) === 'object') {
                        var isFound = false;
                        item.forEach(function (i) {
                            if (i.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                                isFound = true;
                            }
                        })
                        return isFound;
                    }
                    return false;
                }
            }
        }
    });
})
