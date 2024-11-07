const errorMessage = async (error, h, request) => {
  const pageTitle = 'Error Occured'

  try {
    const ext = error?.response?.data?.errors || {};
    var errorMessage = ``;
    errorMessage+=`<h3 class="govuk-notification-banner__heading">${(error?.response?.data?.message || error.toString())}</h3>`;
    if(Object.keys(ext).length>0)
    {
      errorMessage+=`<ul class="full-width-ext">`;
      Object.keys(ext).forEach(res=>{
        errorMessage+=`<li>${res.toUpperCase()} : ${ext[res]}</li>`;
      })
      errorMessage+=`</ul>`;
    }    
    if(request.yar.flash('errorm').length>0)
    {
      return h.response({ message: `Server is Down` }).code(500)
    }
    request.yar.flash('errorm', errorMessage);
   if (request?.headers?.referer || false) {
     return h.redirect(request?.headers?.referer);
   } else {
     return h.redirect('/');
   }
  } catch (err) {
    request.yar.flash('errorm', `An unexpected error occurred. ${err.toString()}`);
    return h.redirect('/');
  }
};

module.exports = { errorMessage };
