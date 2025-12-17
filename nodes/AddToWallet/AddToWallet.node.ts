import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  NodeConnectionTypes,
  NodeOperationError,
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
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Pass',
            value: 'pass',
          },
        ],
        default: 'pass',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['pass'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new wallet pass',
            action: 'Create a pass',
          },
        ],
        default: 'create',
      },
      {
        displayName: 'Card Title',
        name: 'cardTitle',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'Your Business Name',
        displayOptions: {
          show: {
            resource: ['pass'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Header',
        name: 'header',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'John Doe',
        displayOptions: {
          show: {
            resource: ['pass'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Logo URL',
        name: 'logoUrl',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://example.com/logo.png',
        displayOptions: {
          show: {
            resource: ['pass'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Hero Image',
        name: 'heroImage',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://example.com/hero.png',
        displayOptions: {
          show: {
            resource: ['pass'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Background Color',
        name: 'hexBackgroundColor',
        type: 'color',
        required: true,
        default: '#141f31',
        displayOptions: {
          show: {
            resource: ['pass'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Barcode Type',
        name: 'barcodeType',
        type: 'options',
        required: true,
        options: [
          { name: 'QR Code', value: 'QR_CODE' },
          { name: 'PDF417', value: 'PDF_417' },
          { name: 'Aztec', value: 'AZTEC' },
          { name: 'Code 128', value: 'CODE_128' },
        ],
        default: 'QR_CODE',
        displayOptions: {
          show: {
            resource: ['pass'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Barcode Value',
        name: 'barcodeValue',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['pass'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['pass'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Apple Font Color',
            name: 'appleFontColor',
            type: 'color',
            default: '#FFFFFF',
          },
          {
            displayName: 'Apple Hero Image',
            name: 'appleHeroImage',
            type: 'string',
            default: '',
            placeholder: 'https://example.com/apple.png',
          },
          {
            displayName: 'Barcode Alt Text',
            name: 'barcodeAltText',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Google Hero Image',
            name: 'googleHeroImage',
            type: 'string',
            default: '',
            placeholder: 'https://example.com/google.png',
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
          {
            displayName: 'Rectangle Logo',
            name: 'rectangleLogo',
            type: 'string',
            default: '',
            placeholder: 'https://example.com/rectangle.png',
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
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        if (resource === 'pass' && operation === 'create') {
          const cardTitle = this.getNodeParameter('cardTitle', i) as string;
          const header = this.getNodeParameter('header', i) as string;
          const logoUrl = this.getNodeParameter('logoUrl', i) as string;
          const heroImage = this.getNodeParameter('heroImage', i) as string;
          const hexBackgroundColor = this.getNodeParameter('hexBackgroundColor', i) as string;
          const barcodeType = this.getNodeParameter('barcodeType', i) as string;
          const barcodeValue = this.getNodeParameter('barcodeValue', i) as string;
          
          const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
          
          const rectangleLogo = (additionalFields.rectangleLogo as string) || '';
          const googleHeroImage = (additionalFields.googleHeroImage as string) || '';
          const appleHeroImage = (additionalFields.appleHeroImage as string) || '';
          const appleFontColor = (additionalFields.appleFontColor as string) || '#FFFFFF';
          const barcodeAltText = (additionalFields.barcodeAltText as string) || '';

          // text modules (could be empty)
          const textModules = additionalFields.textModules && (additionalFields.textModules as IDataObject).module
            ? ((additionalFields.textModules as IDataObject).module as Array<{
                label: string;
                value: string;
              }>)
            : [];

          const textModulesData = textModules.map((m, idx) => ({
            id: `module${idx}`,
            header: m.label,
            body: m.value,
          }));

          // links
          const links = additionalFields.links && (additionalFields.links as IDataObject).link
            ? ((additionalFields.links as IDataObject).link as Array<{
                label: string;
                url: string;
              }>)
            : [];
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
        } else {
          throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for resource "${resource}"`);
        }
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
