import { gql } from "./client";
import type { Gender, Position, Prefix } from "../types";

export const masterApi = {
  genders: () =>
    gql<{ genders: Gender[] }>(
      `query Genders { genders { id genderCode genderName } }`,
    ).then((d) => d.genders),
  positions: () =>
    gql<{ positions: Position[] }>(
      `query Positions { positions { id positionName } }`,
    ).then((d) => d.positions),
  prefixes: () =>
    gql<{ prefixes: Prefix[] }>(
      `query Prefixes { prefixes { id prefixName genderId } }`,
    ).then((d) => d.prefixes),
};
