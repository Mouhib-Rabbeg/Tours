import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_QOBsxJ8WjoP8eFsmVb8q0EJC00UIJJ1H0L');
export const bookTour = async (tourId) => {
  try {
    // 1)get the session from the server
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });
    //

    // 2)Create checkout Form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
