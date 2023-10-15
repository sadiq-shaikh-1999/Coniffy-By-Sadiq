import shopify from "../shopify.js";
import { GraphqlQueryError } from "@shopify/shopify-api";

const metafieldFieldDetails = {
  namespace: "coinify",
  key: "config"
}
/**
 * Creating metafield dynamically
 *
 * @param {*} req
 * @param {*} res
 */
export const create = async (req, res) => {
    const { shop } = res.locals.shopify.session;
    console.log("----->",shop); 
    const payload = req.body; 
  
    const graphqlClient = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session
    });
  
    try {
      // Find the store ID and the metafield details
      const shopDetails = await graphqlClient.query({
        data: {
          query: `{
            shop {
              id
              metafield(namespace: "${ metafieldFieldDetails.namespace }",key: "${ metafieldFieldDetails.key }") {
                value
              }
            }
          }`
        }
      });
  
      const shopifyStoreID = shopDetails.body.data.shop.id;
      const metafieldData = JSON.parse(shopDetails.body.data.shop.metafield?.value || '{}');
      metafieldData.push(payload);
      
      // Create the metafield
      const createResponse = await graphqlClient.query({
        data: {
          query: `mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
              userErrors {
                field
                message
              }
            }
          }`,
          variables: {
            "metafields": [
              {
                "key": metafieldFieldDetails.key,
                "namespace": metafieldFieldDetails.namespace,
                "ownerId": shopifyStoreID,
                "type": "json",
                "value": JSON.stringify(metafieldData)
              }
            ]
          }
        },
      });
  
      return res.json({payload,metafieldData}).send();
  
    } catch (error) {
      // Handle errors thrown by the graphql client
      if (!(error instanceof GraphqlQueryError)) {
        throw error;
      }
      return res.status(500).send({ error: error.response });
    }
  }
  