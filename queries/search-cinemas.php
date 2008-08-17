<?

define('RAND_ID', 'get-cinema.php - ' . rand(1, 1000));
define('DEBUG', 0);

require_once('../comun/debug.php');
require_once('../comun/js.php');
require_once('../comun/db.php');
require_once('../comun/sql.php');

mysql_pconnect('localhost', 'root', '');
mysql_select_db('adondevamos');

$resultados = array();

$select = new SQL_Select('cine');

$select->addField('cine.id_cine');
$select->addField('cine.op_cine');
$select->addField('CONCAT(cine.direccion, " ", op_localidad) as direccion');
$select->addLeftJoin('localidad', 'cine.id_localidad=localidad.id_localidad');
$select->addJoin('tl_cine_pelicula', 'tl_cine_pelicula.id_cine=cine.id_cine');
$select->addJoin('pelicula', 'tl_cine_pelicula.id_pelicula=pelicula.id_pelicula');
$select->addLimit(0, 10);
$select->addGroup('cine.id_cine');
$select->addOrder('cine.op_cine');

if (isset($_GET['q'])) {
    foreach (preg_split('/\s+/m', trim($_GET['q'])) as $word) {
        $escaped_word = DB_EscapeLike($word);
        $select->addWhere('cine.op_cine LIKE "%' . $escaped_word . '%" || pelicula.op_pelicula LIKE "%' . $escaped_word . '%" || cine.direccion LIKE "%' . $escaped_word .'%" || tl_cine_pelicula.horarios LIKE "%' . $escaped_word . '%" || localidad.op_localidad LIKE "%' . $escaped_word . '%"');
    }
}

if (isset($_GET['id'])) {
    $select->addWhereFieldEquals('cine.id_cine', (int) $_GET['id']);
}

foreach (DB_GetAllAssocOrEnd($select->get()) as $cine) {
    $resultado = array(
        'id' => $cine['id_cine'],
        'name' => $cine['op_cine'],
        'address' => $cine['direccion'],
        'movies' => DB_GetAllAssocOrEnd('SELECT pelicula.id_pelicula AS id, pelicula.op_pelicula AS name, tl_cine_pelicula.horarios AS shows FROM pelicula, tl_cine_pelicula WHERE pelicula.id_pelicula=tl_cine_pelicula.id_pelicula && id_cine="' . (int) $cine['id_cine'] . '"')
    );
    $resultados[] = $resultado;
}

header('Content-Type: text/plain; charset=iso-8859-1');

echo JS_GetObj($resultados);

?>