import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  NodeConnectionTypes,
} from 'n8n-workflow';
import { addToWalletApiRequest } from './GenericFunctions';

export class AddToWallet implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Add To Wallet',
    name: 'addToWallet',
    icon: { light: 'file:addToWallet.svg', dark: 'file:addToWallet.dark.svg' },
    group: ['transform'],
    version: 1,
    description: 'Create digital wallet passes via AddToWallet API',
    defaults: { name: 'Add To Wallet' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'addToWalletApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Card Title',
        name: 'cardTitle',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'Your Business Name',
      },
      {
        displayName: 'Header',
        name: 'header',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'John Doe',
      },
      {
        displayName: 'Logo URL',
        name: 'logoUrl',
        type: 'string',
        default: '',
        placeholder: 'https://example.com/logo.png',
      },
      {
        displayName: 'Rectangle Logo',
        name: 'rectangleLogo',
        type: 'string',
        default: '',
        placeholder: 'https://example.com/rectangle.png',
      },
      {
        displayName: 'Hero Image',
        name: 'heroImage',
        type: 'string',
        default: '',
        placeholder: 'https://example.com/hero.png',
      },
      {
        displayName: 'Google Hero Image',
        name: 'googleHeroImage',
        type: 'string',
        default: '',
        placeholder: 'https://example.com/google.png',
      },
      {
        displayName: 'Apple Hero Image',
        name: 'appleHeroImage',
        type: 'string',
        default: '',
        placeholder: 'https://example.com/apple.png',
      },
      {
        displayName: 'Background Color',
        name: 'hexBackgroundColor',
        type: 'color',
        default: '#141f31',
      },
      {
        displayName: 'Apple Font Color',
        name: 'appleFontColor',
        type: 'color',
        default: '#FFFFFF',
      },
      {
        displayName: 'Barcode Value',
        name: 'barcodeValue',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Barcode Alt Text',
        name: 'barcodeAltText',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Barcode Type',
        name: 'barcodeType',
        type: 'options',
        options: [
          { name: 'QR Code', value: 'QR_CODE' },
          { name: 'PDF417', value: 'PDF_417' },
          { name: 'Aztec', value: 'AZTEC' },
          { name: 'Code 128', value: 'CODE_128' },
        ],
        default: 'QR_CODE',
      },
      {
        displayName: 'Text Modules',
        name: 'textModules',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        placeholder: 'Add Text Module',
        default: {},
        options: [
          {
            name: 'module',
            displayName: 'Module',
            values: [
              {
                displayName: 'Label',
                name: 'label',
                type: 'string',
                default: '',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Links',
        name: 'links',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        placeholder: 'Add Link',
        default: {},
        options: [
          {
            name: 'link',
            displayName: 'Link',
            values: [
              {
                displayName: 'Label',
                name: 'label',
                type: 'string',
                default: '',
              },
              {
                displayName: 'URL',
                name: 'url',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const cardTitle = this.getNodeParameter('cardTitle', i) as string;
        const header = this.getNodeParameter('header', i) as string;
        const logoUrl = this.getNodeParameter('logoUrl', i) as string;
        const rectangleLogo = this.getNodeParameter('rectangleLogo', i) as string;
        const heroImage = this.getNodeParameter('heroImage', i) as string;
        const googleHeroImage = this.getNodeParameter('googleHeroImage', i) as string;
        const appleHeroImage = this.getNodeParameter('appleHeroImage', i) as string;
        const hexBackgroundColor = this.getNodeParameter('hexBackgroundColor', i) as string;
        const appleFontColor = this.getNodeParameter('appleFontColor', i) as string;
        const barcodeValue = this.getNodeParameter('barcodeValue', i) as string;
        const barcodeAltText = this.getNodeParameter('barcodeAltText', i) as string;
        const barcodeType = this.getNodeParameter('barcodeType', i) as string;

        // text modules (could be empty)
        const textModules = this.getNodeParameter('textModules.module', i, []) as Array<{
          label: string;
          value: string;
        }>;

        const textModulesData = textModules.map((m, idx) => ({
          id: `module${idx}`,
          header: m.label,
          body: m.value,
        }));

        // links
        const links = this.getNodeParameter('links.link', i, []) as Array<{
          label: string;
          url: string;
        }>;
        const linksModuleData = links.map((l) => ({
          label: l.label,
          url: l.url,
        }));

        const body: IDataObject = {
          cardTitle,
          header,
          logoUrl,
          rectangleLogo,
          heroImage,
          googleHeroImage,
          appleHeroImage,
          hexBackgroundColor,
          appleFontColor,
          barcodeType,
          barcodeValue: barcodeValue || '',
          barcodeAltText: barcodeAltText || '',
          textModulesData,
          linksModuleData,
        };

        const responseData = await addToWalletApiRequest.call(this, 'POST', '/api/card/create', body);

        const shareableUrl = `${(await this.getCredentials('addToWalletApi')).baseUrl}/card/${responseData.cardId}`;

        returnData.push({
          json: {
            cardId: responseData.cardId,
            message: responseData.msg,
            shareableUrl,
            success: true,
          },
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message, success: false },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
