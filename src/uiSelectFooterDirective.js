uis.directive('uiSelectFooter', function(){
  return {
    template: '<li class="ui-select-footer" ng-transclude></li>',
    restrict: 'EA',
    transclude: true,
    replace: true
  };
});