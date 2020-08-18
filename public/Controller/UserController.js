class UserController{

    constructor(formIdCreate, formIdUpdate, tableId){    

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{

            this.showPanelCreate();

        });

        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save().then(user=>{

                        this.getTr(user, tr);

                        this.updateCount();

                        this.formUpdateEl.reset();

                        btn.disabled = false;

                        this.showPanelCreate();
                        
                    });

                },
                (e) => {
                    console.error(e);
                }
            );

        });

    }


    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) return false;

            this.getPhoto(this.formEl).then(
                (content) => {
                    
                    values.photo = content;

                    values.save().then(user => {

                        this.addLine(user);

                        this.formEl.reset();

                        btn.disabled = false;
                        
                    });

                }, 
                (e) => {
                    console.error(e);
                }
            );

        });

    }


    getPhoto(formEl)
    {
        return new Promise((resolve, reject)=>{

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item=>{//pega um array e forma outro array utilizando um filtro
                if(item.name === 'photo'){
                    return item;
                }
            });
    
            let file = elements[0].files[0];
            
    
            fileReader.onload = ()=>{// função de callback - depois de terminar de executar alguma coisa
    
                resolve(fileReader.result);//parametro para quando a promessa retorna sucesso
            };

            fileReader.onerror = (e)=>{//onerror - evento da filereader para erros
                reject(e); //parametro para quando a promessa retorna algum erro
            };

            if(file)
            {
              fileReader.readAsDataURL(file);
            }
            else
            {
                resolve('img/images.jpg'); //add a foto mesmo se não tiver img pra carregar
            }

        });

       
    }



    selectAll()
    {
        //promise
        User.getUsersStorage().then(data=>{

            data.users.forEach(dataUser=>{

                let user1 = new User();
    
                user1.loadFromJSON(dataUser);//metodo para carregar a partir de um json
    
                this.addLine(user1);
    
            });
            
        });

        
    }

     addLine(dataUser)
    {

        let tr = this.getTr(dataUser);

        //DataSet faz parte da API WEB que permite colocar atributos dentro de cada informação no html

                         
        this.tableEl.appendChild(tr);

        this.updateCount();
        
    }

    getTr(dataUser, tr = null)
    {
        
        if (tr === null) tr = document.createElement('tr');

          //settar dataset via javascript
          tr.dataset.user = JSON.stringify(dataUser);//user é como uma variavel
          //dataset so guarda string por isso é precio serializar(tranf obj em string)

        //innerHTML - recupera ou atribui um valor a um elemento html
        //TEMPLATE STRING
        tr.innerHTML =   `  <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                            <td>${dataUser.name}</td>
                            <td>${dataUser.email}</td>
                            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
                            <td>${Utils.dateFormat(dataUser.register)}</td>
                            <td>
                            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                            <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                            </td>
                         `; 

        this.addEventsTR(tr);

        return tr;
    }

    addEventsTR(tr)
    {

        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if(confirm("Deseja realmente excluir?"))//retorna true ou false
            {

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove().then(data=>{

                        //se true
                    tr.remove();

                    this.updateCount();

                });

               
            }

        });

        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            // console.log(tr);
             let json = JSON.parse(tr.dataset.user);  //transforma string em obj JSON
            
 
             this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;//começa no 0
 
             //For in - laços para percorrer objetos
             for (let name in json)
             {
                 //procura o campo no formulario onde o nome for igual ao nome que esta passando no for in
               let field =   this.formUpdateEl.querySelector("[name="+name.replace("_", "")+"]");
 
 
               if(field){           
 
                 switch(field.type)
                 {
                     case 'file':
                         continue;
                         break;
                     case 'radio':
                         field =   this.formUpdateEl.querySelector("[name="+name.replace("_", "")+"][value="+json[name]+"]");
                         field.checked = true;
                         break;
                     case 'checkbox':
                         field.checked = json[name];
                         break;
                     default:
                         field.value = json[name];//vai preenchendo os campos com os respectivos valores
                 }
 
                 
               }
              
             }

             this.formUpdateEl.querySelector(".photo").src = json._photo;//localiza onde no formulario esta o elemento c class photo
 
             this.showPanelUpdate();
           
         });
    }

    showPanelCreate()
    {
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    showPanelUpdate()
    {
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    updateCount()
    {
       // console.dir(this.tableEl.children);

        let numberUsers = 0;
        let numberAdmin = 0;
      
        //para transformar uma coleção em array é preciso fazer um spread -> ...

        [...this.tableEl.children].forEach(tr=>{

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if(user._admin) numberAdmin++;
            
        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
        


    }

    getValues(formEl)
    {
        //variavel local pode usar LET(recurso novo)
        let user = {};
        let isValid = true;
        
       // console.log(typeof this.formEl.elements);
       //[...this.formEl.elements] = [this.formEl.elements[0],this.formEl.elements[1], this.formEl.elements[2]]
       // ... -> operador SPREAD
        [...formEl.elements].forEach(function(field, index){


            //verificar se os campos obrigatórios foram preenchidos
            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value)
            {
                field.parentElement.classList.add('has-error');
                isValid = false;
                
            }


            if(field.name == "gender")
            {
                if(field.checked)
                user.gender = field.value;
            }
            else if(field.name == "admin")
            {
                user[field.name] = field.checked;
            }
            else
            {
                user[field.name] = field.value;
            }
        
    
        });

        if(!isValid)
        {
            return false;
        }
    
        return new User(
                                  user.name,
                                  user.gender,
                                  user.birth, 
                                  user.country, 
                                  user.email, 
                                  user.password,
                                  user.photo,
                                  user.admin
                                  );

       
    }
}