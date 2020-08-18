class Fetch {

    static get(url, params = {}){

        return Fetch.request('GET', url, params);

    }

    static delete(url, params = {}){

        return Fetch.request('DELETE', url, params);

    }

    static put(url, params = {}){

        return Fetch.request('PUT', url, params);

    }

    static post(url, params = {}){

        return Fetch.request('POST', url, params);

    }

    static request(method, url, params = {}){

        return new Promise((resolve, reject) => {

           

        });

    }

}