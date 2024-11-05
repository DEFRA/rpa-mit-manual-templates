const errorMessage = async (error, h) => {
  try {
    const pageTitle = 'Error Occured'
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
    return h.view('app_views/errorview', { errorMessage , pageTitle}); 
  } catch (err) {
    return h.view('app_views/errorview', { errorMessage: `An unexpected error occurred. ${err.toString()}`, pageTitle});
  }
};

module.exports = { errorMessage };
