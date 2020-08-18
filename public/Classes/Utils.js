class Utils {

    static dateFormat(date)
    {
        //Wed Jan 22 2020 18:38:08 GMT-0300 (Horário Padrão de Brasília)

        return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();


    }


}