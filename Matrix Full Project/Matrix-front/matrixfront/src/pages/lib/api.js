export async function fetcher(url,option = {}){
    let response;
    if(!options){
        reponse = await fetch(url);
    
    }else{
        reponse = await fetch(url,options);
    }
    const data = await response.json();
    return data;

}