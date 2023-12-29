import { ApolloServer } from "@apollo/server";
import { prisma } from "./db.js";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";

(async function () {
  const typeDefs = gql`
    type Ingredient {
      id: ID! @unique
      name: String!
      quantity: String!
      quantityType: String!
    }

    type Recipe {
      id: ID! @unique
      name: String!
      ingredients: [Ingredient]
      instructions: String!
    }

    type Query {
      recipes: [Recipe]
    }

    type Mutation {
      createRecipe(
        name: String!
        ingredients: [Ingredient]
        instuctions: String!
      ): Recipe
    }
  `;
  interface createRecipeInput {
    name: string;
    ingredients?: Array<{
      id?: string;
      name: string;
      quantity: string;
      quantityType: string;
    }>;
    instructions: string;
  }
  const resolvers = {
    Mutation: {
      createRecipe: async (_parent: any, args: createRecipeInput) => {
        const recipe = await prisma.recipe.create({
          data: {
            name: args.name,
            ingredients: {
              create: args.ingredients.map((ingredient) => ({
                name: ingredient.name,
                quantity: ingredient.quantity,
                quantityType: ingredient.quantityType,
              })),
            },
            instructions: args.instructions, // Corrected property name
          },
        });
        return recipe;
      },
    },
    Query: {
      recipes: async () => {
        return prisma.recipe.findMany();
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`🚀 Server ready at ${url}`);

  return server;
});
