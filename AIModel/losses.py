import keras.backend as K
from keras.losses import binary_crossentropy
from keras.losses import categorical_crossentropy
from keras.utils.generic_utils import get_custom_objects

from metrics1 import jaccard_score, f_score

SMOOTH = 1.

__all__ = [
    'jaccard_loss', 'bce_jaccard_loss', 'cce_jaccard_loss',
    'dice_loss', 'bce_dice_loss', 'cce_dice_loss',
]



# ============================== Dice Losses ================================

def dice_loss(gt, pr, class_weights=1., smooth=SMOOTH, per_image=True, beta=1.):
    r"""Dice loss function for imbalanced datasets:

    .. math:: L(precision, recall) = 1 - (1 + \beta^2) \frac{precision \cdot recall}
        {\beta^2 \cdot precision + recall}

    Args:
        gt: ground truth 4D keras tensor (B, H, W, C)
        pr: prediction 4D keras tensor (B, H, W, C)
        class_weights: 1. or list of class weights, len(weights) = C
        smooth: value to avoid division by zero
        per_image: if ``True``, metric is calculated as mean over images in batch (B),
            else over whole batch
        beta: coefficient for precision recall balance

    Returns:
        Dice loss in range [0, 1]

    """
    return 1 - f_score(gt, pr, class_weights=class_weights, smooth=smooth, per_image=per_image, beta=beta)


def bce_dice_loss(gt, pr, bce_weight=0.3, smooth=SMOOTH, per_image=True, beta=1.):
    r"""Sum of binary crossentropy and dice losses:
    
    .. math:: L(A, B) = bce_weight * binary_crossentropy(A, B) + dice_loss(A, B)
    
    Args:
        gt: ground truth 4D keras tensor (B, H, W, C)
        pr: prediction 4D keras tensor (B, H, W, C)
        class_weights: 1. or list of class weights for dice loss, len(weights) = C 
        smooth: value to avoid division by zero
        per_image: if ``True``, dice loss is calculated as mean over images in batch (B),
            else over whole batch
        beta: coefficient for precision recall balance

    Returns:
        loss
    
    """
    bce = K.mean(binary_crossentropy(gt, pr))
    loss = bce_weight * bce + dice_loss(gt, pr, smooth=smooth, per_image=per_image, beta=beta)
    return loss
def bce_dice_loss_gm(gt, pr, gama=1.1, smooth=SMOOTH, per_image=True, beta=1.):
    r"""Sum of binary crossentropy and dice losses:
    
    .. math:: L(A, B) = bce_weight * binary_crossentropy(A, B) + dice_loss(A, B)
    
    Args:
        gt: ground truth 4D keras tensor (B, H, W, C)
        pr: prediction 4D keras tensor (B, H, W, C)
        class_weights: 1. or list of class weights for dice loss, len(weights) = C 
        smooth: value to avoid division by zero
        per_image: if ``True``, dice loss is calculated as mean over images in batch (B),
            else over whole batch
        beta: coefficient for precision recall balance

    Returns:
        loss
    
    """
    bce = K.mean(binary_crossentropy(gt, pr))
    loss = -(1-gama) * bce + gama * dice_loss(gt, pr, smooth=smooth, per_image=per_image, beta=beta)
    return loss

def cce_dice_loss(gt, pr, cce_weight=1., class_weights=1., smooth=SMOOTH, per_image=True, beta=1.):
    r"""Sum of categorical crossentropy and dice losses:
    
    .. math:: L(A, B) = cce_weight * categorical_crossentropy(A, B) + dice_loss(A, B)
    
    Args:
        gt: ground truth 4D keras tensor (B, H, W, C)
        pr: prediction 4D keras tensor (B, H, W, C)
        class_weights: 1. or list of class weights for dice loss, len(weights) = C 
        smooth: value to avoid division by zero
        per_image: if ``True``, dice loss is calculated as mean over images in batch (B),
            else over whole batch
        beta: coefficient for precision recall balance

    Returns:
        loss
    
    """
    cce = categorical_crossentropy(gt, pr) * class_weights
    cce = K.mean(cce)
    return cce_weight * cce + dice_loss(gt, pr, smooth=smooth, class_weights=class_weights, per_image=per_image, beta=beta)


# Update custom objects
get_custom_objects().update({
    'dice_loss': dice_loss,
    'bce_dice_loss': bce_dice_loss,
    'bce_dice_loss_gm': bce_dice_loss_gm,
    'cce_dice_loss': cce_dice_loss,
})
