import { schema } from "nexus";

schema.objectType({
  name: "Post",
  definition(t) {
    t.int("id")
    t.string("title")
    t.string("body")
    t.boolean("published")
  }
})

schema.extendType({
  type: 'Query',
  definition(t) {
    t.field("drafts", {
      type: "Post",
      list: true,
      nullable: false,
      resolve(_root, _args, context) {
        return context.db.posts
      }
    }),
      t.field("posts", {
        type: "Post",
        list: true,
        nullable: false,
        resolve(_root, _args, context) {
          return context.db.posts.filter(post => post.published)
        }
      })
  }
})

schema.extendType({
  type: "Mutation",
  definition(t) {
    t.field("createPost", {
      type: "Post",
      nullable: false,
      args: {
        title: schema.stringArg({ required: true }),
        body: schema.stringArg({ required: true }),
      },
      resolve(_root, args, ctx) {
        const draft = {
          id: ctx.db.posts.length + 1,
          title: args.title,
          body: args.body,
          published: false
        }

        ctx.db.posts.push(draft)

        return draft;
      }
    }),
      t.field("publishPost", {
        type: "Post",
        nullable: false,
        args: {
          postId: schema.intArg({ required: true })
        },
        resolve(_root, args, ctx) {
          const postToPublish = ctx.db.posts.find(post => post.id === args.postId);
          if (!postToPublish) {
            throw new Error(`Post with id: ${args.postId} doesn't exist`);
          }

          postToPublish.published = true
          return postToPublish;
        }
      })
  }
})