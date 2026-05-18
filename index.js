
// Shuffle array.
// Source - https://stackoverflow.com/a/2450976
// Posted by ChristopheD, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-16, License - CC BY-SA 4.0
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}
//end of sourced/referenced code.

async function loadPokemons(numOfPairs) {
  const setOfPokeIds = new Set();
  const mode = (numOfPairs == 3) ? "easy" : ((numOfPairs == 6) ? "medium" : "hard")
  while (setOfPokeIds.size < numOfPairs) {
    setOfPokeIds.add(Math.floor(Math.random() * (1025 - 1 + 1) + 1))
  }
  const ids = Array.from(setOfPokeIds);
  const pokemonData = await Promise.all(
    ids.map(async (id) => {
      let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      return response.json();
    })
  );
  const listOfCards = [];
  pokemonData.forEach(pokemon => {
    listOfCards.push(
      `<div class="card ${mode}">
        <img id="${pokemon.name}1" class="front_face" src="${pokemon.sprites.other['official-artwork'].front_default}" alt="">
        <img class="back_face" src="back.webp" alt="">
      </div>`
    );

    listOfCards.push(
      `<div class="card ${mode}">
        <img id="${pokemon.name}2" class="front_face" src="${pokemon.sprites.other['official-artwork'].front_default}" alt="">
        <img class="back_face" src="back.webp" alt="">
      </div>`
    );
  });
  shuffle(listOfCards);
  $('.game_grid').append(listOfCards.join(""));
};

function endGame(message) {
  $("#message").html(message);
  $(".game_grid").addClass('disabled');
  $("#easy_button").removeClass('disabled');
  $("#medium_button").removeClass('disabled');
  $("#hard_button").removeClass('disabled');
}

var timer = null;

function countdown(startSeconds, pairs) {
  const timerElement = document.getElementById("timer")
  const pairsMatched = $('#pairs_matched').html();
  if (startSeconds > 0 && Number(pairsMatched) < pairs) {
    timer = setTimeout(() => {
      startSeconds--;
      timerElement.innerHTML = `${startSeconds} seconds left`
      countdown(startSeconds, pairs);
    }, 1000)
  } else if (pairsMatched == pairs) {
    endGame('You Win');
    $('#message').addClass('win')
  } else {
    endGame('Game Over');
    $('#message').addClass('lose')
  }
}

function powerUp() {
  const message = $("#message").html();
  $("#message").html('Power Up! See all the cards!')
  const cardsToFlip = $('.card').not('.flip');
  cardsToFlip.addClass("flip");
  $('.game_grid').addClass('disabled');
  setTimeout(() => {
    $("#message").html(message);
    cardsToFlip.removeClass("flip");
    $('.game_grid').removeClass('disabled');
  }, 2500)
}
function loadDifficulty(numOfPairs, difficulty) {
  $(".game_grid").empty();
  $(".game_grid").removeClass('not_live');
  $("#start_button").removeClass('not_live');
  $("#start_button").removeClass('disabled');
  $("#reset_button").removeClass('not_live');
  $("#message").removeClass('not_live');
  $("#message").removeClass('win');
  $("#message").removeClass('lose');
  $("#message").html('Press start to play the Memory Game');
  $('#pairs_left').html(numOfPairs);
  $('#pairs').html(numOfPairs);
  $(`#${difficulty}_button`).addClass('active');
  loadPokemons(numOfPairs);
}
function setup() {
  let firstCard = undefined;
  let secondCard = undefined;
  let timeLimit = 0;
  let pairs = 0;
  let matched = 0;
  let difficulty = null;
  let click = 0;
  let powerUpAvailable = true;

  $("#start_button").on(("click"), function () {
    click = 0;
    matched = 0;
    powerUpAvailable = true;
    $('#num_clicks').html(click);
    $(".game_grid").removeClass("disabled");
    $('#timer').html(`${timeLimit} seconds left`);
    $("#message").html('Game Start!');
    $('#pairs_matched').html(matched);
    $("#easy_button").addClass('disabled');
    $("#medium_button").addClass('disabled');
    $("#hard_button").addClass('disabled');
    $("#start_button").addClass('disabled');
    countdown(timeLimit, pairs);
  })

  $('#reset_button').on(('click'), function () {
    clearTimeout(timer)
    click = 0;
    matched = 0;
    endGame('Game Reset. Press Start to Play');
    loadDifficulty(pairs, difficulty)
    $("#start_button").removeClass('disabled');
    $('#num_clicks').html(click);
    timeLimit = (difficulty === 'easy') ? 30 : ((difficulty === 'medium') ? 60 : 90)
    $('#timer').html(`${timeLimit} seconds`);
    $('#num_clicks').html(click);
    $('#pairs_matched').html(matched);

  })
  $("#easy_button").on(("click"), function () {
    pairs = 3;
    timeLimit = 30;
    matched = 0;
    difficulty = 'easy';
    loadDifficulty(pairs, difficulty)
    $('#timer').html(`${timeLimit} seconds`);
    $(`#hard_button`).removeClass('active');
    $(`#medium_button`).removeClass('active');
    $('#pairs_matched').html(matched);
  })

  $("#medium_button").on(("click"), function () {
    pairs = 6;
    matched = 0;
    difficulty = 'medium';
    loadDifficulty(pairs, difficulty)
    timeLimit = 60;
    $('#timer').html(`${timeLimit} seconds`);
    $(`#hard_button`).removeClass('active');
    $(`#easy_button`).removeClass('active');
    $('#pairs_matched').html(matched);
  })

  $("#hard_button").on(("click"), function () {
    pairs = 9;
    difficulty = 'hard';
    matched = 0;
    loadDifficulty(pairs, difficulty)
    timeLimit = 90;
    $('#timer').html(`${timeLimit} seconds`);
    $(`#easy_button`).removeClass('active');
    $(`#medium_button`).removeClass('active');
    $('#pairs_matched').html(matched);
  })

  $(".game_grid").on("click", '.card', function () {
    click++;
    $('#num_clicks').html(click);

    $(this).toggleClass("flip");
    if (!firstCard)
      firstCard = $(this).find(".front_face")[0]
    else {
      secondCard = $(this).find(".front_face")[0]
      // console.log(firstCard, secondCard);
      if (firstCard.src == secondCard.src) {
        // console.log("match")
        $(`#${firstCard.id}`).parent().off("click")
        $(`#${secondCard.id}`).parent().off("click")
        matched++;
        $('#pairs_matched').html(matched);
        $('#pairs_left').html(pairs - matched);
        firstCard = undefined
        secondCard = undefined
      } else {
        // console.log("no match")
        $(".game_grid").toggleClass("disabled");
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip")
          $(`#${secondCard.id}`).parent().toggleClass("flip")
          $(".game_grid").toggleClass("disabled");
          if (powerUpAvailable && pairs > 0 && click > pairs * 3) {
            powerUp();
            powerUpAvailable = false;
          }
          firstCard = undefined
          secondCard = undefined
        }, 800)
      }
    }
  });
  $('#mode').on('click', function () {
    $('body').toggleClass('dark_mode')
  })
}

$(document).ready(setup)