uis.directive('uiSelectNoChoice',
    ['uiSelectConfig', function (uiSelectConfig) {
        return {
            restrict: 'EA',
            require: '^uiSelect',
            replace: true,
            transclude: true,
            templateUrl: function (tElement) {
                // Gets theme attribute from parent (ui-select)
                var theme = tElement.attr('theme') || uiSelectConfig.theme;
                return theme + '/no-choice.tpl.html';
            }, 
            link: function(scope, element, attrs, $select, transclude) {
                if(!$select.$parent) {
                    var transludeWatch = scope.$watch(function() { return $select.transclusionScope; }, function(trScope) {
                        if(trScope) {
                            doTransclude();
                            transludeWatch();
                        }
                    });
                } else {
                    doTransclude();
                }

                function doTransclude() {
                    transclude($select.transclusionScope, function(clone) {
                        getAppendTarget(element).append(clone);
                    });
                }

                // Get lowest element
                function getAppendTarget(t) {
                    var target = t,
                        next = target;

                    while( next.length ) {
                        target = next;
                        next = next.children();
                    }

                    return target;
                }
            }
        };
    }]);
