<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>cines o películas</title>
<link type="text/css" rel="StyleSheet" href="style.css">
<?
$tinkermanPath = 'tinkerman/';
include('tinkerman/includeLog.php');
?>
<script type="text/javascript" src="/js/dom.js"></script>
<script type="text/javascript" src="/js/Application.js"></script>
<script type="text/javascript" src="/js/query.js"></script>
<script type="text/javascript" src="/js/Highlighter.js"></script>
<script type="text/javascript" src="/js/resultItems.js"></script>
<script type="text/javascript" src="/js/DetailWindow.js"></script>
<script type="text/javascript" src="/js/Navigation.js"></script>
<script type="text/javascript" src="/js/main.js"></script>
</head>
<body onload="app.load()">
<iframe id="NavigationIframe" src="navigation.html" style="display: none"></iframe>
<div id="MainDiv">
  <div class="toolbar">&nbsp;Buscar cines o películas: <input type="text" id="searchInput"> <span class="status" style="visibility: hidden" id="searchingSpan">buscando...</span></div>
  <div id="detailsWindowContainer">
    <div class="detailsWindow" id="detailsWindow" style="display: none">
      <div class="title"><span id="detailsName"></span> <a href="#" id="searchRelated">cines</a></div>
      <div class="info"><span id="detailsInfo"></span></div>
      <div id="detailsDescription"></div>
    </div>
  </div>
  <div id="resultList"></div>
</div>
</body>
</html>