interface ResultURL {
  headers: Array<[string, string]>;
  body:
    | {
        type: 'text';
        data: string;
      }
    | {
        type: 'image';
        size: {
          width: number;
          height: number;
        };
      };
  status: number;
  corsPreflight: {
    headers: Array<[string, string]>;
    status: number;
  };
}
const resultURLObj: ResultURL = {
  headers: [],
  body: { type: 'text', data: '' },
  status: 200,
  corsPreflight: {
    headers: [],
    status: 200,
  },
};
const bodySelectElement = document.querySelector('select') as HTMLSelectElement;
const URLElement = document.querySelector('.url a') as HTMLAnchorElement;
const syncURL = (): void => {
  // sync header
  const syncHeader = ({ isCORS } = { isCORS: false }): void => {
    const headers: Array<[string, string]> = [];
    const headerElements = document.querySelectorAll(
      `${isCORS ? '#cors-container' : '#basic-container'} .header`
    );
    headerElements.forEach((headerElement) => {
      const inputElements = headerElement.querySelectorAll('input');
      const key = inputElements[0].value;
      const value = inputElements[1].value;
      headers.push([key, value]);
    });
    if (isCORS) {
      resultURLObj.corsPreflight.headers = headers;
    } else {
      resultURLObj.headers = headers;
    }
  };
  syncHeader();
  // sync body
  const bodyType = bodySelectElement.value.toLowerCase();
  switch (bodyType) {
    case 'text': {
      const textData = (
        document.querySelector('textarea') as HTMLTextAreaElement
      ).value;
      resultURLObj.body = {
        type: 'text',
        data: textData,
      };
      break;
    }
    case 'image': {
      const width = Number(
        (document.querySelector('#width') as HTMLInputElement).value
      );
      const height = Number(
        (document.querySelector('#height') as HTMLInputElement).value
      );
      resultURLObj.body = {
        type: 'image',
        size: {
          width,
          height,
        },
      };
      break;
    }
    default:
      break;
  }
  // sync status code
  const status = Number(
    (document.querySelector('#status') as HTMLInputElement).value
  );
  resultURLObj.status = status;
  // sync CORS header
  syncHeader({ isCORS: true });
  // sync CORS stauts code
  const CORSStatus = Number(
    (document.querySelector('#cors-status') as HTMLInputElement).value
  );
  resultURLObj.corsPreflight.status = CORSStatus;
  const resultURLObjCopy = JSON.parse(JSON.stringify(resultURLObj)) as Pick<
    Partial<ResultURL>,
    'corsPreflight'
  > &
    Omit<ResultURL, 'corsPreflight'>;
  const CORSContainer = document.querySelector(
    '#cors-container'
  ) as HTMLDivElement;
  if (CORSContainer.hidden) {
    delete resultURLObjCopy.corsPreflight;
  }
  const encodedQuery = LZString.compressToEncodedURIComponent(
    JSON.stringify(resultURLObjCopy)
  );
  URLElement.textContent = `${location.href}server?response=${encodedQuery}`;
  URLElement.href = `${location.href}server?response=${encodedQuery}`;
};
syncURL();
window.addEventListener('input', () => {
  syncURL();
});

// Header(add and remove button)
let inputIdCount = 2;
const baseHeader = document.querySelector('.header') as HTMLDivElement;
const headersSetup = (isCORS: boolean = false): void => {
  const headersElement = document.querySelector(
    `${isCORS ? '#cors-container' : '#basic-container'} .headers`
  );
  const initialHeader = document.querySelector(
    `${isCORS ? '#cors-container' : '#basic-container'} .header`
  );
  const initialHeaderRemoveButton = initialHeader?.querySelector(
    `${isCORS ? '#cors-container' : '#basic-container'} .remove-button`
  );
  const removeButtonEventHandler = function (this: HTMLButtonElement): void {
    this.parentElement?.remove();
    syncURL();
  };
  initialHeaderRemoveButton?.addEventListener(
    'click',
    removeButtonEventHandler
  );
  const addHeaderButton = document.querySelector(
    `${isCORS ? '#cors-container' : '#basic-container'} .add-button`
  );
  addHeaderButton?.addEventListener('click', () => {
    const newHeader = baseHeader.cloneNode(true) as Element;
    const newHeaderInputs = newHeader.querySelectorAll('input');
    inputIdCount += 1;
    newHeaderInputs.forEach((input) => {
      input.placeholder = '';
      input.value = '';
      const labelElement = input.nextElementSibling as HTMLLabelElement;
      input.id = `${labelElement.textContent ?? ''}${inputIdCount}`;
      labelElement.htmlFor = `${labelElement.textContent ?? ''}${inputIdCount}`;
    });
    const newHeaderRemoveButton = newHeader.querySelector(
      '.remove-button'
    ) as HTMLButtonElement;
    newHeaderRemoveButton.addEventListener('click', removeButtonEventHandler);
    headersElement?.append(newHeader);
    syncURL();
  });
};
headersSetup();
// CORS Header
headersSetup(true);

// Body
bodySelectElement.addEventListener('change', (event) => {
  const imageSizeContainer = document.querySelector(
    '.image-size-container'
  ) as HTMLDivElement;
  const textDataContainer = document.querySelector(
    '.text-data-container'
  ) as HTMLDivElement;
  if (bodySelectElement.value === 'Text') {
    textDataContainer.hidden = false;
    imageSizeContainer.hidden = true;
  }
  if (bodySelectElement.value === 'Image') {
    textDataContainer.hidden = true;
    imageSizeContainer.hidden = false;
  }
});

// CORS
const CORSButton = document.querySelector('.cors-button');
const CORSContainer = document.querySelector(
  '#cors-container'
) as HTMLDivElement;
CORSButton?.addEventListener('click', () => {
  const CORSButtonTextShow = document.querySelector(
    '#cors-button-text-show'
  ) as HTMLSpanElement;
  const CORSButtonTextRemove = document.querySelector(
    '#cors-button-text-remove'
  ) as HTMLSpanElement;
  CORSButtonTextShow.hidden = CORSContainer.hidden;
  CORSButtonTextRemove.hidden = !CORSContainer.hidden;
  CORSContainer.hidden = !CORSContainer.hidden;
  syncURL();
});

const copyButton = document.querySelector('#copy-button');
const tooltipText = document.querySelector('.tooltip-text');
let timerId: number;
copyButton?.addEventListener('click', () => {
  const resultURLText = document.querySelector('.url a')?.textContent as string;
  void navigator.clipboard.writeText(resultURLText);
  if (timerId !== undefined) {
    clearTimeout(timerId);
  }
  if (tooltipText !== null) {
    tooltipText.textContent = 'Copied!';
  }
});
document.querySelector('.tooltip')?.addEventListener('mouseleave', () => {
  if (tooltipText === null) return;
  if (tooltipText.textContent === 'Copied!') {
    timerId = window.setTimeout(() => {
      tooltipText.textContent = 'Copy';
    }, 300);
  }
});
(document.querySelector('.year') as HTMLSpanElement).textContent = String(
  new Date().getFullYear()
);
