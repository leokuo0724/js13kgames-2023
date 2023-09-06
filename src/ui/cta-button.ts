import { ButtonClass } from "kontra";

type CTAColorSchema = {
  normal: string;
  hover: string;
  pressed: string;
  disabled: string;
};

export class CTAButton extends ButtonClass {
  protected colorScheme: CTAColorSchema;

  constructor({ colorScheme }: { colorScheme: CTAColorSchema }) {
    super({
      anchor: { x: 0.5, y: 0.5 },
      text: {
        color: "white",
        font: "16px Verdana",
        anchor: { x: 0.5, y: 0.5 },
      },
      width: 100,
      height: 36,
    });
    this.colorScheme = colorScheme;
  }

  public draw() {
    this.context.fillStyle = this.disabled
      ? this.colorScheme.disabled
      : this.pressed
      ? this.colorScheme.pressed
      : this.hovered
      ? this.colorScheme.hover
      : this.colorScheme.normal;
    this.context.fillRect(0, 0, this.width, this.height);
  }
}
