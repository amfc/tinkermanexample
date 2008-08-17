<?php
// Version 1.2

function FIL_GetTempFile($path, $extension, $prefix = '')
{
    $i = 0;
    do {
        if ($i >= 5) {
            return false;
        }
        $filename = $prefix . dechex(rand(0, 2147483647)) . '.' . $extension;
        $i++;
    } while (file_exists($path . '/' . $filename));
    
    return $filename;
}

function FIL_GetDirectoryFileAndExtension($path)
{
    if (($p = strrpos($path, '/')) !== false) {
        $file = substr($path, $p + 1);
        $dir = substr($path, 0, $p);
    } else {
        $file = $path;
        $dir = "";
    }
    if (($p = strrpos($file, '.')) !== false) {
        $extension = substr($file, $p + 1);
        $name = substr($file, 0, $p);
    } else {
        $name = $file;
        $extension = "";
    }
    return array($dir, $name, $extension);
}

function FIL_GetExtension($path)
{
    list(, , $extension) = FIL_GetDirectoryFileAndExtension($path);
    return $extension;
}

function FIL_GetName($path)
{
    list(, $name) = FIL_GetDirectoryFileAndExtension($path);
    return $name;
}

function FIL_WriteStringToFile($string, $file)
{
    $fp = fopen($file, 'w');
    fwrite($fp, $string);
    fclose($fp);
}

function FIL_GetContents($filename)
{
    $fp = fopen($filename, "r");
    $contents = fread($fp, filesize($filename));
    fclose($fp);
    return $contents;
}

function FIL_DownloadPretending($http_url, $user_agent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows 98)")
{
    $expanded_url = explode("://", $http_url);
    if (count($expanded_url) != 2 or (!($expanded_url[0] == "http" or $expanded_url[0] == "https"))) {
        echo "<br><b>error</b>: download_pretending() requires an http or https url<br>";
        return false;
    }
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $http_url);
    curl_setopt($ch, CURLOPT_USERAGENT, $user_agent);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); 
    $result = curl_exec ($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $size = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
    curl_close($ch);
    if ($code == 200 and (!$size or ($size == strlen($result)))) {
        return $result;
    } else {
        echo "content length: $size<br>code: $code";
        return false;
    }
}

?>