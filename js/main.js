let google = document.querySelector('#google');
let out = document.querySelector('.out');
let p = document.createElement('P');
const firebaseConfig = {
    apiKey: "AIzaSyC30c3DZG4qgQe8BeIgL6Y_fGRes7Sk_YY",
    authDomain: "proyectoprueba-f67b1.firebaseapp.com",
    projectId: "proyectoprueba-f67b1",
    storageBucket: "proyectoprueba-f67b1.appspot.com",
    messagingSenderId: "75840391092",
    appId: "1:75840391092:web:7ba83e7ce4c7b908b814e1"
};

try{firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const createUser = (user) => {
    db.collection("users")
      .add(user)
      .then((docRef) => console.log("Document written with ID: ", docRef.id))
      .catch((error) => console.error("Error adding document: ", error));
    };
    let provider = new firebase.auth.GoogleAuthProvider();
    const  singGoogle = async () =>{
    // login pop-up
    firebase.auth().signInWithPopup(provider).then((result) => {
        let name = result.additionalUserInfo.profile.name;
        let email = result.additionalUserInfo.profile.email;
        let id = result.additionalUserInfo.profile.id;
        let date = result.user.metadata.lastSignInTime;
        console.log(result)
        google.classList.add('hidden');
        p.textContent = `Welcome ${name}`;
        document.querySelector('.sign').appendChild(p);
        out.classList.remove('hidden');
        document.querySelector('.start-div').classList.remove('hidden')
        createUser({
            id: id,
            name : name,
            email : email,
            date : date
          });
   }).catch((error) => {
    console.log(error)
   })
}

const signOut = () => {
    firebase.auth().signOut().then(() => {
        console.log('Log out hecho');
        p.remove()
        //document.querySelector('.sign').innerHTML = "";
        out.classList.add('hidden');
        google.classList.remove('.hidden')
        
      }).catch((error) => {
        console.log("hubo un error" + error);
      });
}

out.addEventListener('click', () =>{
    signOut()
})

google.addEventListener('click', () =>{
     singGoogle()
 })}catch{
     
 }


const pregunta = document.querySelector('#question');
const choices = Array.from(document.querySelectorAll('.choice-text'));
const progressText = document.querySelector('#progressText');
const scoreText = document.querySelector('#score');
const progressBarFull = document.querySelector('#progressBarFull');
let currentQuestion = {};
let acceptingAnswers = true;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let questions = [];
let finalScore = 0;


async function questionsApi(){
    try{
        let response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        let data = await response.json()
        data = data.results
        return data
    }catch(err){
        console.log(err)
    }
  }
  
  questionsApi().then(data =>{
    let question = data.map(preg=>{
        return preg.question
    })
    let respuestasInc = data.map(inc =>{
        return inc.incorrect_answers
    })
    let correcta = data.map(cor=>{
        return cor.correct_answer
    })
    for(let i=0;i<data.length;i++){
      quest ={
        question: `${question[i]}`,
        incorrect_answers: [`${respuestasInc[i][0]}`, `${respuestasInc[i][1]}`, `${respuestasInc[i][2]}`], //[`${respuestasInc[0][0]}, ${respuestasInc[0][1]}, ${respuestasInc[0][2]}`],
        correct_answer : `${correcta[i]}`}
      questions.push(quest)
    }

    
    const score_points = 100;
    const max_questions = 10;
    startGame = () =>{
        questionCounter = 0;
        score = 0;
        availableQuestions = [...questions]
        getNewQuestion()
    }
    getNewQuestion = () =>{
        if(availableQuestions.length == 0 || questionCounter > max_questions){
            
            return window.location.assign('../pages/scores.html')
        }
        questionCounter++;
        if(progressText){
            progressText.innerText = `Question ${questionCounter} of ${max_questions}`;
            progressBarFull.style.width = `${(questionCounter/max_questions) * 100}%`;
            const questionsIndex = Math.floor(Math.random() * availableQuestions.length);
            currentQuestion = availableQuestions[questionsIndex];
            pregunta.innerText = `${currentQuestion.question}`;
            /*choices.forEach(choice => {
                const number = choice.dataset['number'];
                choice.innerText = currentQuestion['incorrect_answers'][number]
            })*/
            choices[0].innerText = `${currentQuestion.incorrect_answers[0]}`
            choices[1].innerText = `${currentQuestion.incorrect_answers[1]}`
            choices[2].innerText = `${currentQuestion.incorrect_answers[2]}`
            choices[3].innerText = `${currentQuestion.correct_answer}`
            availableQuestions.splice(questionsIndex, 1);
            acceptingAnswers = true;
        }

    }
    choices.forEach(choice =>{
        choice.addEventListener('click', e =>{
            if(!acceptingAnswers) return
            acceptingAnswers = false;
            const selectedChoice = e.target;
            const selectedAnswer = selectedChoice.dataset['number'];
            let classToApply = selectedAnswer == choices[3].dataset['number'] ? 'correct' : 'incorrect';
            if(classToApply == 'correct'){
                finalScore += 1;
                incrementScore(score_points)
            }
            selectedChoice.parentElement.classList.add(classToApply)

            setTimeout(() =>{
                selectedChoice.parentElement.classList.remove(classToApply)
                getNewQuestion()
            },1000)
        })
      })

    
    incrementScore = num => {
        score +=num;
        scoreText.innerText = score;
    }
    startGame()
})

