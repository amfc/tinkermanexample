<?

define('RAND_ID', 'get-cinema.php - ' . rand(1, 1000));

require_once('../comun/debug.php');
require_once('../comun/js.php');
require_once('../comun/db.php');
require_once('../comun/sql.php');
require_once('../comun/files.php');

mysql_pconnect('localhost', 'root', '');
mysql_select_db('adondevamos');

function GetBigPhoto($filename)
{
    $nameWithOutExtension = substr($filename, 0, strrpos($filename, "."));
    $extension = strrchr($filename, ".");
    return $nameWithOutExtension . "_big" . $extension;
}

function AddPhotosToArray(&$result)
{
    $i = 1;
    $photos = array();
    while (isset($result['photo' . $i])) {
        $file = $result['photo' . $i];
        //unset($result['photo' . $i]);
        ++$i;
        if (!$file) {
            continue;
        }
        $photo = array('file' => $file);
        $file = '/www/docs/adondevamos.com/fotos/pelicula/' . $file;
        if (!file_exists($file)) {
            continue;
        }
        $image_info = getimagesize($file);
        $photo['width'] = $image_info[0];
        $photo['height'] = $image_info[1];
        
        $file = GetBigPhoto($file);
        if (file_exists($file)) {
            $image_info = getimagesize($file);
            list(, $name, $extension) = FIL_GetDirectoryFileAndExtension($file);
            $photo['bigFile'] = $name . '.' . $extension;
            $photo['bigWidth'] = $image_info[0];
            $photo['bigHeight'] = $image_info[1];
        }
        $photos[] = $photo;
    }
    $result['photos'] = $photos;
}

if (!isset($_GET['id'])) {
    EndWithError('Missing required parameter');
} else {
    $id = (int) $_GET['id'];
}

$resultados = array();

$select = new SQL_Select('pelicula');

$select->addField('pelicula.op_pelicula AS name');
$select->addField('pelicula.comentario AS description');
$select->addField('pelicula.ft_foto1 AS photo1');
$select->addField('pelicula.ft_foto2 AS photo2');
$select->addField('pelicula.ft_foto3 AS photo3');
$select->addField('"" AS info');
$select->addWhereFieldEquals('id_pelicula', $id);

$result = DB_GetOneAssocOrEnd($select->get());
AddPhotosToArray($result);

header('Content-Type: text/plain; charset=iso-8859-1');

echo JS_GetObj($result);

?>