import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../src/app";
import { resetCollaborators } from "../src/features/collaborators/collaborator.repository";

describe("collaborator api", () => {
  beforeEach(async () => {
    await resetCollaborators();
  });

  it("adds and lists collaborators with a custom username for the owner", async () => {
    const createResponse = await request(app)
      .post("/api/collaborators")
      .set("X-Owner-Email", "owner@example.com")
      .send({
        email: "  TEAMMate@Example.com  ",
        username: "  Design Partner  ",
      })
      .expect(201);

    expect(createResponse.body.data).toMatchObject({
      email: "teammate@example.com",
      ownerEmail: "owner@example.com",
      username: "Design Partner",
    });
    expect(createResponse.body.data.id).toEqual(expect.any(String));

    const listResponse = await request(app).get("/api/collaborators").set("X-Owner-Email", "owner@example.com").expect(200);

    expect(listResponse.body.data).toEqual([createResponse.body.data]);
  });

  it("only lists collaborators for the owner who added them", async () => {
    await request(app)
      .post("/api/collaborators")
      .set("X-Owner-Email", "owner-a@example.com")
      .send({
        email: "friend-a@example.com",
        username: "Friend A",
      })
      .expect(201);

    await request(app)
      .post("/api/collaborators")
      .set("X-Owner-Email", "owner-b@example.com")
      .send({
        email: "friend-b@example.com",
        username: "Friend B",
      })
      .expect(201);

    const response = await request(app).get("/api/collaborators").set("X-Owner-Email", "owner-a@example.com").expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].username).toBe("Friend A");
  });

  it("rejects duplicate collaborator emails", async () => {
    await request(app)
      .post("/api/collaborators")
      .set("X-Owner-Email", "owner@example.com")
      .send({
        email: "friend@example.com",
        username: "Friend",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/collaborators")
      .set("X-Owner-Email", "owner@example.com")
      .send({
        email: "FRIEND@example.com",
        username: "Friend Again",
      })
      .expect(409);

    expect(response.body.error.message).toBe("Collaborator email already added");
  });
});
