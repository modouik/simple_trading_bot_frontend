"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { RiVipCrownLine } from "react-icons/ri";
import {
  AUTH_SUBSCRIPTION_REQUIRED_EVENT,
  type SubscriptionRequiredDetail,
} from "@/lib/auth/constants";

const DEFAULT_MESSAGE = "Your subscription is no longer active. Please renew to continue using the service.";
const DEFAULT_TITLE = "Subscription required";

export function SubscriptionRequiredModal() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<SubscriptionRequiredDetail>({});

  const handleEvent = useCallback((e: CustomEvent<SubscriptionRequiredDetail>) => {
    const payload = e.detail ?? {};
    setDetail({
      message: payload.message || DEFAULT_MESSAGE,
      redirect_url: payload.redirect_url,
    });
    setOpen(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => handleEvent(e as CustomEvent<SubscriptionRequiredDetail>);
    window.addEventListener(AUTH_SUBSCRIPTION_REQUIRED_EVENT, handler);
    return () => window.removeEventListener(AUTH_SUBSCRIPTION_REQUIRED_EVENT, handler);
  }, [handleEvent]);

  const handleClose = () => {
    setOpen(false);
    setDetail({});
  };

  const handleGoToSubscription = () => {
    const url = detail.redirect_url;
    if (url) {
      window.location.href = url;
    } else {
      handleClose();
    }
  };

  const hasRedirect = Boolean(detail.redirect_url);

  return (
    <Modal
      isOpen={open}
      toggle={handleClose}
      centered
      className="subscription-required-modal"
      backdrop="static"
    >
      <ModalHeader className="subscription-required-modal__header" toggle={handleClose}>
        <span className="subscription-required-modal__icon" aria-hidden>
          <RiVipCrownLine size={24} />
        </span>
        {DEFAULT_TITLE}
      </ModalHeader>
      <ModalBody className="subscription-required-modal__body">
        <p className="subscription-required-modal__message">{detail.message}</p>
        {hasRedirect && (
          <p className="subscription-required-modal__hint">
            You can renew or manage your plan on our subscription site.
          </p>
        )}
      </ModalBody>
      <ModalFooter className="subscription-required-modal__footer">
        {hasRedirect && (
          <button
            type="button"
            className="btn subscription-required-modal__btn-primary"
            onClick={handleGoToSubscription}
          >
            Go to subscription
          </button>
        )}
        <button
          type="button"
          className="btn subscription-required-modal__btn-secondary"
          onClick={handleClose}
        >
          {hasRedirect ? "Close" : "OK"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
