<?

define('RAND_ID', 'get-cinema.php - ' . rand(1, 1000));
define('DEBUG', 0);

require_once('../includes/debug.php');
require_once('../includes/js.php');
require_once('../includes/db.php');
require_once('../includes/sql.php');

mysql_pconnect('localhost', 'root', '');
mysql_select_db('adondevamos');

if (!isset($_GET['id'])) {
    EndWithError('Missing required parameter');
} else {
    $id = (int) $_GET['id'];
}

$resultados = array();

$select = new SQL_Select('cine');

$select->addField('cine.op_cine AS name');
$select->addField('cine.comentario AS description');
$select->addField('CONCAT(cine.direccion, " ", op_localidad, " - ", cine.telefono) as info');
$select->addLeftJoin('localidad', 'cine.id_localidad=localidad.id_localidad');
$select->addWhereFieldEquals('id_cine', $id);

header('Content-Type: text/plain; charset=iso-8859-1');

echo JS_GetObj(DB_GetOneAssocOrEnd($select->get()));

?>