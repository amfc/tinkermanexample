program punteros1(input, output);

type

    ptr =^r;
    
    r =record
        n :integer;
        p :ptr;
    end;

Function Push(Lista: Ptr; elemento: Integer): Ptr;
var

    nuevo :ptr;
    lista2 :ptr;
    
begin

    new(nuevo);
    nuevo^.n :=elemento;
    nuevo^.p :=nil;
    
    if lista = nil then
        push :=nuevo
        else
        begin
        lista2 :=lista;
        while lista2^.p <> nil do
            lista2 :=lista2^.p;
        lista2^.p :=nuevo;
        push :=lista2;
        end;
        
end;


var

    lista :ptr;
    
begin

    new(lista);
    lista^.n :=5;
    lista^.p :=nil;
    
    