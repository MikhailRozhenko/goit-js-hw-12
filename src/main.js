import { getImagesByQuery } from './js/pixabay-api.js';
import {
  clearGallery,
  createGallery,
  hideLoader,
  hideLoadMoreButton,
  showLoader,
  showLoadMoreButton,
} from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = form.querySelector('input[name="search-text"]');
const loadmoreEL = document.querySelector('.load-button');

let query = '';
let page = 1;
let perPage = 15;
let totalHits = 0;

showLoadMoreButton();

form.addEventListener('submit', async e => {
  e.preventDefault();

  query = input.value.trim();
  page = 1;

  if (query === '') {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  clearGallery();
  showLoadMoreButton();
  hideLoader();

  try {
    const data = await getImagesByQuery(query, page, perPage);
    totalHits = data.totalHits;

    if (!data.hits.length) {
      iziToast.error({
        title: 'Sorry',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    const firstCard = document.querySelector('.gallery li');
    if (firstCard) {
      const cardHeight = firstCard.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }

    if (page < Math.ceil(totalHits / perPage)) {
      hideLoadMoreButton();
    } else {
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong! Please try again later.',
      position: 'topRight',
    });
    console.error(error);
  } finally {
    showLoader();
  }
});

loadmoreEL.addEventListener('click', async e => {
  e.preventDefault();

  page += 1;

  try {
    const data = await getImagesByQuery(query, page, perPage);

    createGallery(data.hits);

    // — Плавная прокрутка после загрузки следующей группы —
    const firstCard = document.querySelector('.gallery li');
    if (firstCard) {
      const cardHeight = firstCard.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }

    if (page >= Math.ceil(totalHits / perPage)) {
      hideLoadMoreButton();
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images!',
      position: 'topRight',
    });
    console.error(error);
  }
});
