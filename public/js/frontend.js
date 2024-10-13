document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('dishInput');
    const suggestionsList = document.createElement('div');
    suggestionsList.classList.add('autocomplete-items');
  
    input.addEventListener('input', async () => {
      const query = input.value.trim();
  
      if (query.length > 0) {
        try {
          const response = await fetch(`/autocomplete?query=${query}`);
          const suggestions = await response.json();
  
          suggestionsList.innerHTML = '';
  
          const suggestionTemplate = document.createElement('div');
          suggestionTemplate.innerHTML = '<strong></strong>';
  
          suggestions.forEach(suggestion => {
            const suggestionItem = suggestionTemplate.cloneNode(true);
            suggestionItem.querySelector('strong').textContent = suggestion.substr(0, query.length);
            suggestionItem.appendChild(document.createTextNode(suggestion.substr(query.length)));
            suggestionItem.dataset.suggestion = suggestion;
            suggestionsList.appendChild(suggestionItem);
          });
  
          input.parentNode.appendChild(suggestionsList);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        suggestionsList.remove();
      }
    });
  
    suggestionsList.addEventListener('click', event => {
      const selectedSuggestion = event.target.closest('div');
      if (selectedSuggestion) {
        input.value = selectedSuggestion.dataset.suggestion;
        suggestionsList.remove();
      }
    });
  
    input.addEventListener('keydown', event => {
      const activeSuggestion = suggestionsList.querySelector('.autocomplete-active');
      if (event.key === 'ArrowDown') {
        if (!activeSuggestion) {
          suggestionsList.firstElementChild.classList.add('autocomplete-active');
        } else {
          activeSuggestion.nextElementSibling?.classList.add('autocomplete-active');
          activeSuggestion.classList.remove('autocomplete-active');
        }
      } else if (event.key === 'ArrowUp') {
        if (!activeSuggestion) {
          suggestionsList.lastElementChild.classList.add('autocomplete-active');
        } else {
          activeSuggestion.previousElementSibling?.classList.add('autocomplete-active');
          activeSuggestion.classList.remove('autocomplete-active');
        }
      } else if (event.key === 'Enter') {
        if (activeSuggestion) {
          input.value = activeSuggestion.dataset.suggestion;
          suggestionsList.remove();
        }
      }
    });
  
    document.addEventListener('click', event => {
      if (!event.target.closest('.autocomplete-items')) {
        suggestionsList.remove();
      }
    });
  });

function ReloadDish(){
  location.reload();
};