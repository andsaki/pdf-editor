import { gql } from "@apollo/client";

export const UPDATE_INVOICE_MUTATION = gql`
  mutation UpdateInvoice($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoice(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`;

export const GENERATE_PDF_MUTATION = gql`
  mutation GeneratePdf($html: String!) {
    generatePdf(html: $html)
  }
`;

export const GET_COMPANY_INFO = gql`
  query GetCompanyInfo {
    getCompanyInfo {
      name {
        label
        value
      }
      zip {
        label
        value
      }
      prefecture {
        label
        value
      }
      city {
        label
        value
      }
      street {
        label
        value
      }
      building {
        label
        value
      }
      tel {
        label
        value
      }
      fax {
        label
        value
      }
      email {
        label
        value
      }
      contact_person {
        label
        value
      }
      registration_number {
        label
        value
      }
      payment_due_date {
        label
        value
      }
      bank_account {
        label
        value
      }
    }
  }
`;

export const GET_INVOICE = gql`
  query GetInvoice($id: ID!) {
    getInvoice(id: $id) {
      id
      name
      createdAt
      updatedAt
      layout {
        id
        type
        x
        y
        width
        height
        zIndex
        locked
        visible
        content
        contentType
        label
        src
        data {
          id
          content
          contentType
          label
          style {
            fontFamily
            fontSize
            bold
            italic
          }
        }
        shapeType
        style {
          fontFamily
          fontSize
          lineHeight
          textAlign
          verticalAlign
          color
          bold
          italic
          wordWrap
          backgroundColor
          textShadow
          isBullet
        }
      }
      form {
        issue_date {
          value
          label
        }
        due_date {
          value
          label
        }
        invoice_number {
          value
          label
        }
        recipient_name {
          value
          label
        }
        recipient_title {
          value
          label
        }
        recipient_zip {
          value
          label
        }
        recipient_prefecture {
          value
          label
        }
        recipient_city {
          value
          label
        }
        recipient_street {
          value
          label
        }
        recipient_building {
          value
          label
        }
        recipient_tel {
          value
          label
        }
        recipient_email {
          value
          label
        }
        recipient_department_name {
          value
          label
        }
        recipient_contact_name {
          value
          label
        }
        subtotal {
          value
          label
        }
        tax {
          value
          label
        }
        total {
          value
          label
        }
        line_items {
          name {
            value
            label
          }
          date {
            value
            label
          }
          quantity {
            value
            label
          }
          unit_price {
            value
            label
          }
          amount {
            value
            label
          }
        }
        notes {
          value
          label
        }
      }
    }
  }
`;
