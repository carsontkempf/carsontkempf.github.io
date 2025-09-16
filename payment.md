---
layout: default
title: Payment
permalink: /payment/
---

<div class="payment-container">
    <h1>Redirecting to Payment...</h1>
    <p>Please wait while we redirect you to our secure payment processor.</p>
    <div class="loading-spinner">Loading...</div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Stripe configuration
    const stripePublicKey = '{{ site.stripe.public_key }}';
    const stripeRedirectUrl = '{{ site.stripe.redirect_url }}';
    
    // Initialize Stripe redirect
    function redirectToStripeCheckout() {
        try {
            // You can customize these parameters based on your needs
            const checkoutUrl = new URL('https://checkout.stripe.com/pay');
            
            // Add your specific Stripe session parameters here
            checkoutUrl.searchParams.append('success_url', window.location.origin + '/payment-success/');
            checkoutUrl.searchParams.append('cancel_url', window.location.origin + '/payment-cancel/');
            
            // If you have a specific Stripe session ID, use it here
            if (stripeRedirectUrl) {
                window.location.href = stripeRedirectUrl;
            } else {
                // Fallback: redirect to your Stripe account or custom checkout
                console.log('Stripe redirect URL not configured. Set site.stripe.redirect_url in _config.yml');
                alert('Payment system not configured. Please contact support.');
            }
        } catch (error) {
            console.error('Error redirecting to Stripe:', error);
            alert('Error accessing payment system. Please try again or contact support.');
        }
    }
    
    // Auto-redirect after a short delay
    setTimeout(redirectToStripeCheckout, 2000);
    
    // Also provide manual redirect option
    const manualRedirectBtn = document.createElement('button');
    manualRedirectBtn.textContent = 'Click here if not redirected automatically';
    manualRedirectBtn.onclick = redirectToStripeCheckout;
    manualRedirectBtn.style.marginTop = '20px';
    manualRedirectBtn.style.padding = '10px 20px';
    manualRedirectBtn.style.backgroundColor = '#635bff';
    manualRedirectBtn.style.color = 'white';
    manualRedirectBtn.style.border = 'none';
    manualRedirectBtn.style.borderRadius = '4px';
    manualRedirectBtn.style.cursor = 'pointer';
    
    document.querySelector('.payment-container').appendChild(manualRedirectBtn);
});
</script>

<style>
.payment-container {
    text-align: center;
    padding: 50px 20px;
    max-width: 500px;
    margin: 0 auto;
}

.loading-spinner {
    font-size: 18px;
    color: #666;
    margin: 20px 0;
}

.loading-spinner:after {
    content: '';
    animation: dots 1.5s steps(5, end) infinite;
}

@keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60% { content: '...'; }
    80%, 100% { content: ''; }
}
</style>