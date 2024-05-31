import { Bytes, crypto, Address, log } from "@graphprotocol/graph-ts";

import { List as ListEntity, Rent as RentEntity } from "../generated/schema";
import {
  List as ListEvent,
  Rent as RentEvent,
  RentReturn as RentReturnEvent,
  RentReturnForced as RentReturnForcedEvent,
  NftRent,
} from "../generated/NftRent/NftRent";

export function handleList(event: ListEvent): void {
  let entity = new ListEntity(event.params.listId);

  let contract = NftRent.bind(event.address);
  let list = contract.listInfos(event.params.listId);

  entity.owner = list.getOwner();
  entity.tokenContract = list.getTokenContract();
  entity.tokenId = list.getTokenId();
  entity.rentDuration = list.getRentDuration();
  entity.ethFee = list.getEthFee();
  entity.fulfilled = list.getFulfilled();

  entity.save();
}

export function handleRent(event: RentEvent): void {
  let entity = new RentEntity(event.params.rentId);
  let entityList = ListEntity.load(event.params.listId);

  if (entityList != null) {
    let contract = NftRent.bind(event.address);
    let rent = contract.rentInfos(event.params.rentId);

    entity.list = event.params.listId;
    entity.renter = rent.getRenter();
    entity.rentEndsAt = rent.getRentEndsAt();
    entity.closed = false;
    entity.forceClosed = false;

    entityList.rentedBy = entity.id;
    entityList.fulfilled = true;

    entity.save();
    entityList.save();
  }
}

export function handleRentReturn(event: RentReturnEvent): void {
  let entity = RentEntity.load(event.params.rentId);

  if (entity != null) {
    entity.closed = true;

    entity.save();
  }
}

export function handleRentReturnForced(event: RentReturnForcedEvent): void {
  let entity = RentEntity.load(event.params.rentId);

  if (entity != null) {
    entity.closed = true;
    entity.forceClosed = true;

    entity.save();
  }
}
